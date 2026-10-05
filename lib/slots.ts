// Franjas de agenda de la clínica. Horario y duración salen de knowledge-base.md:
// L-V 7:00-18:00, sábado 8:00-13:00, domingo y festivos cerrado, valoración de 30 min.
// Colombia no tiene horario de verano (UTC-5 todo el año): se arman los ISO con "-05:00"
// y no hace falta librería de zonas horarias. Sin imports: lo corre `node --test` tal cual.

export const DURACION_MIN = 30;
export const MIN_ANTICIPACION_MIN = 120;
export const DIAS_VISIBLES = 14;

const OFFSET_MS = 5 * 3600 * 1000;

// [apertura, cierre] en horas; el índice es el día de la semana (0 = domingo).
const HORARIO: Record<number, [number, number]> = {
  1: [7, 18],
  2: [7, 18],
  3: [7, 18],
  4: [7, 18],
  5: [7, 18],
  6: [8, 13],
};

// ponytail: festivos escritos a mano para el último trimestre de 2026 y enero de 2027. Verificados
// el 2026-10-04 contra festivos.com.co y magneto365.com/co/blog/festivos-colombia-2026. A partir del
// 12 de enero de 2027 faltan: extender la lista o calcularlos (Ley Emiliani) antes de esa fecha.
export const FESTIVOS = new Set([
  "2026-10-12",
  "2026-11-02",
  "2026-11-16",
  "2026-12-08",
  "2026-12-25",
  "2027-01-01",
  "2027-01-11",
]);

const dos = (n: number) => String(n).padStart(2, "0");

// ms desde epoch -> "YYYY-MM-DDTHH:MM:SS-05:00". Corre el reloj 5 h y lee el resultado como UTC.
export function aISO(ms: number): string {
  return `${new Date(ms - OFFSET_MS).toISOString().slice(0, 19)}-05:00`;
}

// Fecha de hoy en Bogotá, "YYYY-MM-DD".
export function fechaColombia(ms: number): string {
  return aISO(ms).slice(0, 10);
}

// Las DIAS_VISIBLES fechas desde hoy, en Bogotá.
export function fechasVisibles(ahoraMs: number): string[] {
  const hoy = fechaColombia(ahoraMs);
  const base = Date.parse(`${hoy}T00:00:00-05:00`);
  return Array.from({ length: DIAS_VISIBLES }, (_, i) => fechaColombia(base + i * 86400000));
}

// Inicios de franja de un día ("YYYY-MM-DD"). Vacío si es domingo, festivo o la fecha no existe.
export function slotsDelDia(fecha: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || FESTIVOS.has(fecha)) return [];
  // Mediodía UTC: el día de la semana de la fecha escrita no depende de la zona de quien corre esto.
  const dia = new Date(`${fecha}T12:00:00Z`);
  if (Number.isNaN(dia.getTime()) || dia.toISOString().slice(0, 10) !== fecha) return [];
  const horas = HORARIO[dia.getUTCDay()];
  if (!horas) return [];
  const slots: string[] = [];
  for (let min = horas[0] * 60; min + DURACION_MIN <= horas[1] * 60; min += DURACION_MIN) {
    slots.push(`${fecha}T${dos(Math.floor(min / 60))}:${dos(min % 60)}:00-05:00`);
  }
  return slots;
}

export function finSlot(inicioISO: string): string {
  return aISO(Date.parse(inicioISO) + DURACION_MIN * 60000);
}

export interface Ocupado {
  start: string;
  end: string;
}

// Quita las franjas que ya pasaron (o están dentro de la anticipación mínima) o que se cruzan
// con algo ocupado del calendario. Cruce = empieza antes de que el otro termine y termina después.
export function filtrarLibres(slots: string[], ocupados: Ocupado[], ahoraMs: number): string[] {
  const desde = ahoraMs + MIN_ANTICIPACION_MIN * 60000;
  const rangos = ocupados.map((o) => [Date.parse(o.start), Date.parse(o.end)]);
  return slots.filter((s) => {
    const ini = Date.parse(s);
    const fin = ini + DURACION_MIN * 60000;
    return ini >= desde && !rangos.some(([a, b]) => ini < b && fin > a);
  });
}

// Una franja es agendable solo si es EXACTAMENTE una que generamos, dentro de la ventana visible.
// Comparar el texto evita tener que parsear lo que manda un desconocido por la red.
export function slotValido(inicioISO: string, ahoraMs: number): boolean {
  const fecha = inicioISO.slice(0, 10);
  return (
    fechasVisibles(ahoraMs).includes(fecha) &&
    slotsDelDia(fecha).includes(inicioISO) &&
    filtrarLibres([inicioISO], [], ahoraMs).length === 1
  );
}
