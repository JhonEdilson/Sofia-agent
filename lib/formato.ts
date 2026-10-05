// Formatos de fecha y hora en español de Colombia. Sin imports: lo reutilizan el formulario y la sección
// "por dentro", y se puede correr con `node` tal cual.

// "2026-10-06" -> "mar". Mediodía UTC para que el día de la semana no dependa de la zona del visitante.
export const diaCorto = (f: string) =>
  new Date(`${f}T12:00:00Z`).toLocaleDateString("es-CO", { weekday: "short", timeZone: "UTC" }).replace(".", "");

// "2026-10-06" -> "martes, 6 de octubre"
export const diaLargo = (f: string) =>
  new Date(`${f}T12:00:00Z`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

// ISO con offset -> "7:00 a. m." en hora de Bogotá.
export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  });
