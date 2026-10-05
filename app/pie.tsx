import { Flecha } from "./flecha";

const SECCIONES = [
  ["Tratamientos", "#tratamientos"],
  ["Su primera visita", "#proceso"],
  ["Agendar valoración", "#agendar"],
  ["Preguntas frecuentes", "#preguntas"],
  ["Horario y ubicación", "#horario"],
] as const;

const enlace = "enlace-sub inline-block transition-colors duration-300 hover:text-pearl focus-visible:text-pearl";

// Pie de página. Lleva el aviso de ficción (PRODUCT.md, principio 3), que nunca puede faltar, como pieza
// propia y visible. Cierra con el nombre gigante del hero en tono casi invisible: la página termina con el
// mismo gesto con el que empezó.
export function Pie({ contactoHref }: { contactoHref: string | null }) {
  return (
    <footer className="px-8 pb-6 pt-16 text-demo-text md:px-16 md:pt-24">
      <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <p className="font-display text-medio text-pearl">Sonrisa Viva</p>
          <p className="mt-3 max-w-sm text-cuerpo">
            Clínica odontológica ficticia en El Poblado, Medellín. Odontología estética, ortodoncia y una
            asistente virtual que atiende y agenda.
          </p>
        </div>

        <nav aria-label="Secciones de la página">
          <p className="text-cuerpo font-semibold text-pearl">Secciones</p>
          <ul className="mt-4 space-y-3 text-cuerpo">
            {SECCIONES.map(([texto, href]) => (
              <li key={href}>
                <a href={href} className={enlace}>
                  {texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-cuerpo font-semibold text-pearl">Esta demostración</p>
          <ul className="mt-4 space-y-3 text-cuerpo">
            <li>
              <a href="#por-dentro" className={enlace}>
                Lo que pasa por dentro
              </a>
            </li>
            {contactoHref && (
              <li>
                <a href={contactoHref} className={enlace} rel="noopener noreferrer">
                  Escribirle a Jhon por WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-14 rounded-2xl border border-pearl/15 p-5 md:flex md:items-start md:gap-6 md:p-6">
        <span className="inline-block shrink-0 rounded-full border border-pearl/30 px-3 py-1 text-nota font-semibold text-pearl">
          Negocio ficticio
        </span>
        <p className="mt-3 max-w-3xl text-cuerpo md:mt-0">
          Clínica Odontológica Sonrisa Viva es una demostración de portafolio creada por Jhon Escobar. El
          nombre, la dirección, el teléfono y los precios son inventados, y las fotos están generadas con
          inteligencia artificial. No corresponde a ninguna clínica real ni ofrece servicios odontológicos.
          Sofía es una asistente virtual de inteligencia artificial, no una persona.
        </p>
      </div>

      {/* Marca de agua decorativa. El texto va en ::after y no en el DOM: WCAG exime a la decoración del
          contraste mínimo, pero axe/Lighthouse medían este 1.14:1 aunque tuviera aria-hidden. */}
      <div
        aria-hidden="true"
        className="mt-14 select-none overflow-hidden whitespace-nowrap text-center font-display text-[12.8vw] uppercase leading-[.8] text-pearl/[.07] after:content-['Sonrisa_Viva'] md:text-[min(13.2vw,250px)]"
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-pearl/10 pt-5 text-nota">
        <p>Demo de portafolio de Jhon Escobar</p>
        <a href="#inicio" className={`${enlace} inline-flex items-center gap-2 text-pearl`}>
          Volver arriba
          {/* La flecha diagonal girada -45° apunta hacia arriba. */}
          <Flecha className="size-3.5 -rotate-45" />
        </a>
      </div>
    </footer>
  );
}
