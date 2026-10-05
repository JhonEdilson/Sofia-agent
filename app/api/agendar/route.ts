// POST /api/agendar: agenda la valoración inicial desde el formulario de la landing.
// Es un endpoint público: valida todo, solo acepta franjas que lib/slots genera y no manda correos.
import { crearCita } from "@/lib/google-calendar";
import { finSlot, slotValido } from "@/lib/slots";

// Tope por campo: lo escribe un desconocido, no se confía en su tamaño.
const LIMITES = { nombre: 120, email: 160 } as const;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "json_invalido" }, { status: 400 });
  }

  // Honeypot: un campo oculto que una persona no ve y un bot sí rellena. Se responde "ok" para no
  // darle al bot la pista de que fue detectado.
  if (typeof body.website === "string" && body.website.trim() !== "") return Response.json({ ok: true });

  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  if (!nombre || nombre.length > LIMITES.nombre) {
    return Response.json({ error: "campo_invalido: nombre" }, { status: 400 });
  }
  // Teléfono: solo dígitos tras quitar espacios, guiones, paréntesis y "+"; 7 a 15 dígitos.
  const telefono = typeof body.telefono === "string" ? body.telefono.replace(/[\s\-()+]/g, "") : "";
  if (!/^\d{7,15}$/.test(telefono)) {
    return Response.json({ error: "campo_invalido: telefono" }, { status: 400 });
  }
  // Correo opcional: solo se guarda en la descripción de la cita, nunca se le escribe.
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email && (email.length > LIMITES.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return Response.json({ error: "campo_invalido: email" }, { status: 400 });
  }
  const inicio = typeof body.inicio === "string" ? body.inicio : "";
  if (!slotValido(inicio, Date.now())) {
    return Response.json({ error: "slot_invalido" }, { status: 400 });
  }
  const fin = finSlot(inicio);

  try {
    const r = await crearCita({ inicio, fin, nombre, telefono, email: email || undefined });
    if (!r.ok) return Response.json({ error: r.motivo }, { status: 409 });
    return Response.json({ ok: true, inicio, fin });
  } catch (error) {
    console.error("agendar", error);
    return Response.json({ error: "agenda_no_disponible" }, { status: 502 });
  }
}
