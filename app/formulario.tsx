"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { diaCorto, diaLargo, hora } from "@/lib/formato";
import { fechaColombia, fechasVisibles, slotsDelDia } from "@/lib/slots";
import { useDemo } from "./demo-estado";

// lib/slots no importa nada: se reutiliza aquí para saber qué días están cerrados sin ir al servidor.

type Resultado = { fecha: string; slots?: string[]; error?: true };

const campo =
  "h-12 w-full rounded-xl border border-line bg-white px-4 text-base outline-offset-2 outline-ink focus-visible:outline-2";

export function Formulario({ contactoHref }: { contactoHref: string | null }) {
  // Hoy en Bogotá. El servidor entrega "" y el navegador el día real: sin desajuste de hidratación
  // y sin congelar la fecha del build, porque la página se prerenderiza.
  const hoy = useSyncExternalStore(
    () => () => {},
    () => fechaColombia(Date.now()),
    () => "",
  );
  const dias = useMemo(
    () => (hoy ? fechasVisibles(Date.parse(`${hoy}T12:00:00-05:00`)) : []),
    [hoy],
  );
  const primerAbierto = dias.find((f) => slotsDelDia(f).length > 0) ?? "";

  const [elegida, setElegida] = useState("");
  const fecha = elegida || primerAbierto;
  const [slot, setSlot] = useState("");
  const horaElegida = slot.startsWith(fecha) ? slot : ""; // una hora de otro día deja de valer
  const [res, setRes] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [confirmada, setConfirmada] = useState("");
  const { registrarCita } = useDemo();

  // `res` guarda a qué fecha pertenece: si no coincide con la elegida, se está cargando.
  const cargando = fecha !== "" && res?.fecha !== fecha;

  useEffect(() => {
    if (!fecha) return;
    const ctl = new AbortController();
    fetch(`/api/disponibilidad?fecha=${fecha}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { slots: string[] }) => setRes({ fecha, slots: d.slots }))
      .catch((e: Error) => {
        if (e.name !== "AbortError") setRes({ fecha, error: true });
      });
    return () => ctl.abort();
  }, [fecha, intento]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!horaElegida) return;
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    setErrorEnvio("");
    try {
      const r = await fetch("/api/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          telefono: datos.get("telefono"),
          email: datos.get("email"),
          website: datos.get("website"), // honeypot: una persona no lo ve
          inicio: horaElegida,
        }),
      });
      const d: { ok?: boolean; error?: string } = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setConfirmada(horaElegida);
        // Avisa a la sección "por dentro". Cada confirmación del formulario es una cita distinta.
        registrarCita({
          id: `form-${horaElegida}`,
          origen: "formulario",
          inicio: horaElegida,
          titulo: `Valoración inicial: ${String(datos.get("nombre") ?? "").trim()}`,
        });
      } else if (d.error === "slot_ocupado" || d.error === "slot_invalido") {
        setErrorEnvio("Esa hora acaba de ocuparse. Elija otra, por favor.");
        setSlot("");
        setIntento((n) => n + 1); // vuelve a pedir las franjas libres
      } else if (d.error?.startsWith("campo_invalido")) {
        setErrorEnvio(
          d.error.includes("telefono")
            ? "Revise el teléfono: solo números, de 7 a 15 dígitos."
            : d.error.includes("email")
              ? "Revise el correo: no parece una dirección válida."
              : "Revise su nombre, por favor.",
        );
      } else {
        setErrorEnvio("No pudimos agendar en este momento. Intente de nuevo o hable con Sofía.");
      }
    } catch {
      setErrorEnvio("No pudimos agendar en este momento. Intente de nuevo o hable con Sofía.");
    } finally {
      setEnviando(false);
    }
  }

  if (confirmada) {
    return (
      <div className="flex h-full flex-col justify-center" role="status">
        <svg viewBox="0 0 48 48" aria-hidden="true" className="size-14 text-ink" fill="none">
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
          <path className="trazo-check" d="M14 25l7 7 13-15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="mt-5 font-display text-medio">Su valoración quedó agendada</h3>
        <p className="mt-3 text-lead font-medium first-letter:uppercase">
          {diaLargo(confirmada.slice(0, 10))}, {hora(confirmada)}
        </p>
        <p className="mt-3 max-w-md text-cuerpo text-muted">
          Esta cita es de demostración: quedó en el calendario de la clínica ficticia y nadie va a
          llamarle. Si quiere ver cómo se ve por dentro, siga bajando.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmada("");
            setSlot("");
            setIntento((n) => n + 1);
          }}
          className="mt-6 w-fit rounded-full border border-ink px-5 py-2.5 text-sm font-bold transition-[color,background-color,transform] duration-300 hover:bg-ink hover:text-pearl active:scale-[.97]"
        >
          Agendar otra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-7">
      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold">1. Elija el día</legend>
        {/* La fila queda dentro del relleno de la tarjeta (no se sale hasta el borde): el día que asoma se
            desvanece en vez de quedar rebanado, y `pr-7` deja el último día completo al llegar al final. */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 pr-7 [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] [scrollbar-width:none] md:grid md:grid-cols-7 md:overflow-visible md:pb-0 md:pr-0 md:[mask-image:none]">
          {dias.length === 0 && (
            <div className="h-[68px] w-full rounded-2xl bg-sheet motion-safe:animate-pulse" aria-hidden="true" />
          )}
          {dias.map((f) => {
            const cerrado = slotsDelDia(f).length === 0;
            return (
              <label key={f} className="relative shrink-0 md:shrink">
                <input
                  type="radio"
                  name="dia"
                  value={f}
                  checked={fecha === f}
                  disabled={cerrado}
                  onChange={() => setElegida(f)}
                  className="peer sr-only"
                />
                <span className="flex min-w-14 cursor-pointer flex-col items-center gap-0.5 rounded-2xl border border-line px-2 py-2.5 text-center outline-offset-2 outline-ink transition-colors duration-200 hover:border-ink peer-disabled:hover:border-line peer-checked:border-ink peer-checked:bg-ink peer-checked:text-pearl peer-focus-visible:outline-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
                  <span className="text-[11px] font-semibold uppercase tracking-wide">
                    {f === hoy ? "Hoy" : diaCorto(f)}
                  </span>
                  <span className="text-xl font-medium leading-none">{Number(f.slice(8))}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-nota text-muted">Lunes a viernes de 7:00 a. m. a 6:00 p. m. y sábados de 8:00 a. m. a 1:00 p. m.</p>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold">2. Elija la hora</legend>
        <div className="mt-3" aria-live="polite">
          {cargando ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="h-11 rounded-xl bg-sheet motion-safe:animate-pulse" />
              ))}
            </div>
          ) : res?.error ? (
            <div role="alert" className="rounded-xl bg-sheet p-4 text-cuerpo">
              <p>No pudimos cargar la agenda en este momento.</p>
              <button type="button" onClick={() => { setRes(null); setIntento((n) => n + 1); }} className="mt-2 font-bold underline">
                Reintentar
              </button>
              <span className="text-muted"> o hable con Sofía, aquí al lado.</span>
            </div>
          ) : res?.slots?.length === 0 ? (
            <p className="rounded-xl bg-sheet p-4 text-cuerpo">
              No quedan horas libres ese día. Elija otro, por favor.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {res?.slots?.map((s) => (
                <label key={s} className="relative">
                  <input
                    type="radio"
                    name="hora"
                    value={s}
                    checked={horaElegida === s}
                    onChange={() => setSlot(s)}
                    className="peer sr-only"
                  />
                  <span className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-line text-sm font-medium outline-offset-2 outline-ink transition-colors duration-200 hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-pearl peer-focus-visible:outline-2">
                    {hora(s)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold">3. Sus datos</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium">
            Nombre
            <input name="nombre" required maxLength={120} autoComplete="name" className={`${campo} mt-1.5 font-normal`} />
          </label>
          <label className="text-sm font-medium">
            Teléfono
            <input name="telefono" type="tel" inputMode="tel" required autoComplete="tel" className={`${campo} mt-1.5 font-normal`} />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Correo <span className="font-normal text-muted">(opcional)</span>
            <input name="email" type="email" maxLength={160} autoComplete="email" className={`${campo} mt-1.5 font-normal`} />
          </label>
        </div>
        {/* Honeypot: fuera de pantalla y fuera del orden de tabulación. */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <p className="mt-3 text-nota text-muted">
          Es una demo: su nombre y teléfono quedan en el calendario de Jhon Escobar, solo para mostrar
          cómo funciona la agenda. Puede escribir datos de prueba.
          {contactoHref && (
            <>
              {" "}Si quiere que los borre,{" "}
              <a href={contactoHref} className="font-semibold underline">
                escríbale por WhatsApp
              </a>
              .
            </>
          )}
        </p>
      </fieldset>

      <div>
        {errorEnvio && (
          <p role="alert" className="mb-3 rounded-xl bg-sheet p-3 text-cuerpo">
            {errorEnvio}
          </p>
        )}
        <button
          type="submit"
          disabled={!horaElegida || enviando}
          className="rounded-full border border-ink bg-ink px-7 py-3.5 text-sm font-bold text-pearl transition-[color,background-color,transform] duration-300 enabled:hover:bg-transparent enabled:hover:text-ink enabled:active:scale-[.97] disabled:opacity-40"
        >
          {enviando ? "Agendando…" : "Confirmar mi valoración"}
        </button>
        {!horaElegida && !cargando && !res?.error && (
          <p className="mt-2 text-nota text-muted">Elija una hora para continuar.</p>
        )}
      </div>
    </form>
  );
}
