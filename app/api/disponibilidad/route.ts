// GET /api/disponibilidad?fecha=YYYY-MM-DD: franjas libres de ese día para la valoración de 30 min.
// Cruza el horario de la clínica (lib/slots) con lo ocupado en el Google Calendar compartido con el
// agente de voz, así que lo que reserva el agente desaparece de aquí y viceversa.
import { ocupado } from "@/lib/google-calendar";
import { fechasVisibles, filtrarLibres, slotsDelDia } from "@/lib/slots";

export async function GET(req: Request) {
  const fecha = new URL(req.url).searchParams.get("fecha") ?? "";
  const ahora = Date.now();
  if (!fechasVisibles(ahora).includes(fecha)) {
    return Response.json({ error: "fecha_invalida" }, { status: 400 });
  }

  const slots = slotsDelDia(fecha);
  if (slots.length === 0) return Response.json({ fecha, slots: [] }); // domingo o festivo

  try {
    const fin = new Date(Date.parse(slots.at(-1)!) + 30 * 60000).toISOString();
    const libres = filtrarLibres(slots, await ocupado(slots[0], fin), ahora);
    return Response.json({ fecha, slots: libres });
  } catch (error) {
    // El detalle va al log del servidor, no al visitante.
    console.error("disponibilidad", error);
    return Response.json({ error: "agenda_no_disponible" }, { status: 502 });
  }
}
