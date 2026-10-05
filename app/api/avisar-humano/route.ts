// POST /api/avisar-humano: lo llama el webhook tool `avisar_humano` de ElevenLabs
// cuando el paciente quiere reprogramar, cancelar o hablar con una persona.
// Manda un correo en texto plano a recepción (AVISO_TO) con la Gmail API,
// desde la cuenta de agente que autorizó el refresh token (scope gmail.send).
import { timingSafeEqual } from "node:crypto";

const MOTIVOS = ["reprogramar", "cancelar", "hablar_con_persona"];

// Tope por campo: los datos los dicta un desconocido por voz, no se confía en su tamaño.
const LIMITES = { nombre: 120, contacto: 160, resumen: 1500 } as const;

// Comparación en tiempo constante para que el secreto no se adivine midiendo latencia.
function secretoValido(recibido: string | null) {
  const esperado = process.env.AVISAR_SECRET;
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Cambia el refresh token por un access token de una hora.
// ponytail: se pide uno nuevo en cada aviso; con 20 conversaciones al día no vale la pena cachearlo.
async function accessTokenGmail() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      // Mismo cliente OAuth del proyecto de GCP con el que se emitió el refresh token.
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GMAIL_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  // `invalid_grant` aquí casi siempre es un refresh token revocado o vencido, no un bug del código.
  if (!res.ok) throw new Error(`oauth ${res.status} ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token as string;
}

// Arma el mensaje RFC 2822 que pide la Gmail API, codificado en base64url.
function mensajeRaw(para: string, asunto: string, texto: string) {
  const mime = [
    `To: ${para}`,
    // Encoded-word UTF-8: sin esto las tildes del asunto llegan rotas.
    `Subject: =?UTF-8?B?${Buffer.from(asunto).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    // Cuerpo en base64 cortado a 76 caracteres por línea, como pide el estándar MIME.
    Buffer.from(texto).toString("base64").match(/.{1,76}/g)!.join("\r\n"),
  ].join("\r\n");
  return Buffer.from(mime).toString("base64url");
}

export async function POST(req: Request) {
  if (!secretoValido(req.headers.get("x-avisar-secret"))) {
    return Response.json({ error: "no_autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "json_invalido" }, { status: 400 });
  }

  const motivo = String(body.motivo ?? "");
  if (!MOTIVOS.includes(motivo)) {
    return Response.json({ error: "motivo_invalido" }, { status: 400 });
  }

  // Cada campo: obligatorio, string, sin vacíos y dentro de su tope.
  const campos = {} as Record<keyof typeof LIMITES, string>;
  for (const [campo, max] of Object.entries(LIMITES) as [keyof typeof LIMITES, number][]) {
    const valor = typeof body[campo] === "string" ? (body[campo] as string).trim() : "";
    if (!valor || valor.length > max) {
      return Response.json({ error: `campo_invalido: ${campo}` }, { status: 400 });
    }
    campos[campo] = valor;
  }

  const asunto = `[Sonrisa Viva] ${motivo}: ${campos.nombre.replace(/[\r\n]+/g, " ")}`;
  const texto = [
    `Motivo: ${motivo}`,
    `Nombre: ${campos.nombre}`,
    `Contacto: ${campos.contacto}`,
    "",
    "Resumen de la conversación:",
    campos.resumen,
  ].join("\n");

  try {
    const token = await accessTokenGmail();
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ raw: mensajeRaw(process.env.AVISO_TO ?? "", asunto, texto) }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`gmail ${res.status} ${await res.text()}`);
  } catch (error) {
    // El detalle va al log del servidor. 502: el fallo es de Google, no del pedido.
    // El procedure lo toma como falla y se lo dice al paciente.
    console.error("aviso", error);
    return Response.json({ error: "correo_no_enviado" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
