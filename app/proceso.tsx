import type { CSSProperties } from "react";

// Textos alineados con projects/voice-agent-clinica/knowledge-base.md (qué traer, 30 min, gratuita,
// acompañante de menores, el valor depende del caso). No se describe ningún procedimiento clínico.
// Los números 01, 02, 03 se quedan: aquí el orden sí es información (antes, durante, después).
const PASOS = [
  {
    n: "01",
    titulo: "Antes de venir",
    texto:
      "Agende por el formulario o con Sofía. Lleve su documento de identidad y, si tiene radiografías o historia odontológica de otro lugar, tráigalas. Los menores de 18 años vienen con un adulto.",
  },
  {
    n: "02",
    titulo: "La valoración, 30 minutos",
    texto:
      "Un odontólogo revisa su caso y escucha qué quiere cambiar de su sonrisa. No necesita saber qué tratamiento quiere: para eso es la cita.",
  },
  {
    n: "03",
    titulo: "Usted decide",
    texto:
      "Le explicamos qué opciones tiene, cuánto toman y cuánto cuestan en su caso. La valoración es gratuita y no lo compromete a nada: puede pensarlo.",
  },
];

export function Proceso() {
  return (
    <section id="proceso" className="px-5 md:px-10">
      {/* Escritorio: el título se queda fijo a la izquierda mientras los pasos pasan a la derecha, así la
          sección no repite la rejilla de columnas de tratamientos. top-[120px] = barra de navegación (84 px)
          más aire. Móvil: todo apilado, sin sticky. */}
      <div className="border-t border-line py-16 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:py-24">
        <h2 data-aparecer="subir" className="max-w-2xl font-display text-titulo md:sticky md:top-[120px] md:self-start">
          Su primera visita, paso a paso
        </h2>

        <ol className="mt-10 grid grid-cols-1 gap-10 md:mt-0 md:gap-14">
          {PASOS.map((p, i) => (
            <li
              key={p.n}
              data-aparecer="subir"
              className="border-t border-ink pt-5 md:grid md:grid-cols-[6rem_minmax(0,1fr)] md:gap-6 md:pt-7"
              style={{ "--i": i } as CSSProperties}
            >
              <span className="font-display text-titulo text-muted" aria-hidden="true">
                {p.n}
              </span>
              <div>
                <h3 className="mt-5 text-card font-medium tracking-[-.02em] md:mt-0">{p.titulo}</h3>
                <p className="mt-2 max-w-[52ch] text-cuerpo text-muted">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
