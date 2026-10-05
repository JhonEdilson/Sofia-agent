// Traduce los eventos de tool que emite ElevenLabs durante la conversación con Sofía a lo que muestra la
// sección "por dentro". Sin imports: lo corre `node --test lib/eventos-sofia.test.ts` tal cual.
//
// Cada tool emite dos eventos con el mismo tool_call_id (uno sin y otro con `full_tool_result`), así que
// quien consume esto debe fusionar por `id`, no sumar. El contenido de `full_tool_result` se lee con
// cautela: su forma exacta para create_event no está verificada contra una conversación real.

export interface EventoTool {
  tool_name: string;
  tool_call_id: string;
  is_error?: boolean;
  full_tool_result?: string; // string JSON; solo llega si el evento de payload completo está activo
}

export type Interpretado =
  | { tipo: "cita"; id: string; inicio?: string; titulo?: string }
  | { tipo: "aviso"; id: string }
  | null;

// Lee un string anidado ("start" -> "dateTime") de un valor desconocido, sin asumir su forma.
function leerTexto(valor: unknown, ruta: string[]): string | undefined {
  let actual: unknown = valor;
  for (const clave of ruta) {
    if (typeof actual !== "object" || actual === null) return undefined;
    actual = (actual as Record<string, unknown>)[clave];
  }
  return typeof actual === "string" && actual !== "" ? actual : undefined;
}

export function interpretarEvento(e: EventoTool): Interpretado {
  // Un error de la tool nunca se muestra como éxito: la sección no debe afirmar lo que no pasó.
  if (e.is_error) return null;

  if (e.tool_name.endsWith("create_event")) {
    let datos: unknown;
    try {
      datos = e.full_tool_result ? JSON.parse(e.full_tool_result) : undefined;
    } catch {
      datos = undefined;
    }
    // Un resultado que trae `error` aunque el evento no venga marcado como error tampoco es éxito.
    if (typeof datos === "object" && datos !== null && "error" in datos) return null;
    return {
      tipo: "cita",
      id: e.tool_call_id,
      inicio: leerTexto(datos, ["start", "dateTime"]),
      titulo: leerTexto(datos, ["summary"]),
    };
  }

  if (e.tool_name === "avisar_humano") return { tipo: "aviso", id: e.tool_call_id };

  return null;
}
