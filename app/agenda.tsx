import { Formulario } from "./formulario";
import { PanelSofia } from "./sofia";

// Dos puertas, un calendario: lo que agenda el formulario desaparece de las franjas de Sofía y al revés.
export function Agenda({ contactoHref }: { contactoHref: string | null }) {
  return (
    <section id="agendar" className="px-5 md:px-10">
      <div className="border-t border-line py-16 md:py-24">
        <div data-aparecer="subir" className="max-w-2xl">
          <h2 className="font-display text-titulo">Agende su valoración</h2>
          <p className="mt-4 text-lead text-muted">
            La valoración es gratuita: treinta minutos para revisar su caso, sin compromiso. Elija usted el
            día y la hora, o hable con Sofía. Las dos formas usan el mismo calendario.
          </p>
        </div>

        {/* grid-cols-1 = minmax(0,1fr): sin esto la fila de 14 días ensancha la columna en móvil. */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-[1.4fr_1fr]">
          <div data-aparecer="fundir" className="min-w-0 rounded-[20px] bg-white p-5 md:p-8">
            <Formulario contactoHref={contactoHref} />
          </div>
          <div id="sofia" data-aparecer="fundir" className="rounded-[20px] bg-ink p-6 text-pearl md:p-8">
            <PanelSofia />
          </div>
        </div>
      </div>
    </section>
  );
}
