// Google Calendar por fetch con refresh token, mismo patrón que app/api/avisar-humano (sin googleapis).
// El token se emite con scope `calendar` completo: freeBusy no funciona con `calendar.events` (da 403
// en ejecución, no al compilar). La cuenta es la del agente y solo guarda datos de demo.
import { createHash } from "node:crypto";

const API = "https://www.googleapis.com/calendar/v3";

export interface Ocupado {
  start: string;
  end: string;
}

// ponytail: se pide un access token por llamada; con el tráfico de un demo no vale la pena cachearlo.
async function accessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  // `invalid_grant` casi siempre es un refresh token vencido (app de GCP en Testing) o revocado.
  if (!res.ok) throw new Error(`oauth ${res.status} ${await res.text()}`);
  return (await res.json()).access_token as string;
}

const calendarId = () => process.env.GOOGLE_CALENDAR_ID ?? "primary";
const urlEventos = () => `${API}/calendars/${encodeURIComponent(calendarId())}/events`;

async function llamar(path: string, init: RequestInit = {}) {
  const res = await fetch(path, {
    ...init,
    headers: {
      authorization: `Bearer ${await accessToken()}`,
      "content-type": "application/json",
    },
    cache: "no-store",
  });
  return res;
}

// Rangos ocupados entre dos instantes. Si Google no pudo leer el calendario (id mal escrito, sin
// permiso) devuelve `errors` en vez de `busy`: se trata como falla, nunca como "todo libre", porque
// eso abriría la agenda entera a doble cita.
export async function ocupado(timeMin: string, timeMax: string): Promise<Ocupado[]> {
  const res = await llamar(`${API}/freeBusy`, {
    method: "POST",
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId() }] }),
  });
  if (!res.ok) throw new Error(`freebusy ${res.status} ${await res.text()}`);
  const cal = (await res.json()).calendars?.[calendarId()];
  if (!cal || cal.errors?.length) throw new Error(`freebusy calendario ilegible ${JSON.stringify(cal)}`);
  return cal.busy ?? [];
}

// Id determinístico por FRANJA, no por persona: Google rechaza con 409 un segundo insert con el mismo
// id, así que dos visitantes que piden la misma hora a la vez no pueden ganar los dos. Charset de
// Google: a-v y 0-9, 5-1024 caracteres; hex ya cumple.
const idDeFranja = (inicio: string) =>
  createHash("sha256").update(`sonrisa-viva|${inicio}`).digest("hex").slice(0, 32);

const huella = (telefono: string) => createHash("sha256").update(telefono).digest("hex").slice(0, 16);

export interface Cita {
  inicio: string;
  fin: string;
  nombre: string;
  telefono: string;
  email?: string;
}

export type ResultadoCita = { ok: true; yaExistia: boolean } | { ok: false; motivo: "slot_ocupado" };

// Crea el evento. Sin invitados y sin `sendUpdates`: el formulario es público y no debe hacer que la
// cuenta de la clínica mande correos a cualquier dirección que alguien escriba.
export async function crearCita(c: Cita): Promise<ResultadoCita> {
  const cuerpo = {
    summary: `Valoración inicial: ${c.nombre}`,
    description: [`Tel: ${c.telefono}`, c.email && `Correo: ${c.email}`, "Reservada desde la web (demo)."]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: c.inicio, timeZone: "America/Bogota" },
    end: { dateTime: c.fin, timeZone: "America/Bogota" },
    // Para distinguir "el mismo paciente reintentó" de "otra persona ya tomó la hora".
    extendedProperties: { private: { paciente: huella(c.telefono) } },
  };
  const id = idDeFranja(c.inicio);

  // 1) ¿Ya hay un evento con el id de esta franja? Se mira ANTES del chequeo de ocupado, porque ese
  // chequeo vería el evento del propio paciente y un reintento (doble clic, corte de red) quedaría
  // como "ocupado" aunque su cita sí se creó.
  const res = await llamar(`${urlEventos()}/${id}`);
  const previo = res.ok ? await res.json() : null;
  if (previo && previo.status !== "cancelled") {
    return previo.extendedProperties?.private?.paciente === huella(c.telefono)
      ? { ok: true, yaExistia: true }
      : { ok: false, motivo: "slot_ocupado" };
  }

  // 2) Lo que reservó el agente de voz tiene otro id: solo se ve consultando lo ocupado.
  if ((await ocupado(c.inicio, c.fin)).length > 0) return { ok: false, motivo: "slot_ocupado" };

  if (previo) {
    // Google reserva el id para siempre: insertar de nuevo daría 409 y la cita quedaría fantasma (el
    // sitio diría "agendado" y el calendario no tendría nada). Hay que revivir el evento cancelado.
    const rev = await llamar(`${urlEventos()}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed", ...cuerpo }),
    });
    if (!rev.ok) throw new Error(`revive ${rev.status} ${await rev.text()}`);
    return { ok: true, yaExistia: false };
  }

  const ins = await llamar(urlEventos(), { method: "POST", body: JSON.stringify({ id, ...cuerpo }) });
  if (ins.ok) return { ok: true, yaExistia: false };
  // 409 aquí = otro visitante insertó esta franja entre el paso 1 y este: perdimos la carrera.
  if (ins.status === 409) return { ok: false, motivo: "slot_ocupado" };
  throw new Error(`insert ${ins.status} ${await ins.text()}`);
}
