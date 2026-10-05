"use client";

import { diaLargo, hora } from "@/lib/formato";
import { BotonFlecha } from "./boton";
import { useDemo } from "./demo-estado";
import { Flecha } from "./flecha";

// La capa de demostración: lo que registra el sistema cuando la visita agenda o habla con Sofía.
// Arranca vacía y se llena en vivo. Nunca muestra algo que no pasó: si no hay evento, no hay tarjeta llena.
function Tarjeta({ titulo, hecho, children }: { titulo: string; hecho: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-pearl/15 bg-pearl/[.04] p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-card font-medium tracking-[-.01em]">{titulo}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-nota font-semibold ${
            hecho ? "bg-pearl text-ink" : "border border-pearl/30 text-pearl/70"
          }`}
        >
          {hecho ? "Pasó" : "Todavía no"}
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function PorDentro({ contactoHref }: { contactoHref: string | null }) {
  const { cita, aviso } = useDemo();

  return (
    <section id="por-dentro" className="px-5 pb-5 md:px-10 md:pb-10">
      <div className="rounded-[20px] bg-ink px-5 py-12 text-pearl md:px-12 md:py-20">
        <div data-aparecer="subir" className="max-w-2xl">
          <h2 className="font-display text-titulo">Lo que acaba de pasar por dentro</h2>
          <p className="mt-4 text-lead text-pearl/80">
            Esta es la capa de demostración: el paciente no ve nada de esto. Es lo que deja registrado el
            sistema cuando usted agenda o habla con Sofía. Pruébelo arriba y mire cómo se llena.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2 md:gap-5" aria-live="polite">
          <Tarjeta titulo="La cita en el calendario" hecho={!!cita}>
            {cita ? (
              <div key={cita.id} className="aparece">
                <p className="text-cuerpo font-semibold text-pearl/70">
                  {cita.origen === "formulario" ? "Desde el formulario" : "Con Sofía"}
                </p>
                <p className="mt-1 text-dato font-medium tracking-[-.02em] first-letter:uppercase">
                  {cita.inicio
                    ? `${diaLargo(cita.inicio.slice(0, 10))}, ${hora(cita.inicio)}`
                    : "Sofía creó la cita en el calendario"}
                </p>
                {cita.titulo && <p className="mt-1 text-cuerpo text-pearl/80">{cita.titulo}</p>}
                <p className="mt-4 text-cuerpo text-pearl/80">
                  El evento ya está en el Google Calendar de la clínica. Esa hora desapareció del
                  formulario y de las franjas de Sofía: así no hay doble cita.
                </p>
              </div>
            ) : (
              <>
                <p className="text-cuerpo text-pearl/80">
                  Aún no hay una cita de esta visita. Agende con el formulario o con Sofía y aparece aquí
                  al instante.
                </p>
                <a href="#agendar" className="enlace-sub mt-4 inline-flex items-center gap-2 text-sm font-bold">
                  Ir a agendar <Flecha className="size-3.5" />
                </a>
              </>
            )}
          </Tarjeta>

          <Tarjeta titulo="El aviso a recepción" hecho={!!aviso}>
            {aviso ? (
              <div key={aviso.id} className="aparece">
                <p className="text-dato font-medium tracking-[-.02em]">Recepción recibió un correo a las {aviso.hora}</p>
                <p className="mt-4 text-cuerpo text-pearl/80">
                  Lleva el motivo, el nombre y el contacto del paciente y un resumen de la conversación.
                  Así una persona retoma lo que Sofía no puede resolver.
                </p>
              </div>
            ) : (
              <p className="text-cuerpo text-pearl/80">
                Sale cuando Sofía debe pasar un caso a una persona. Pruébelo: dígale que quiere cancelar
                o reprogramar una cita.
              </p>
            )}
          </Tarjeta>
        </div>

        <div data-aparecer="subir" className="mt-12 border-t border-pearl/15 pt-10 md:mt-16 md:pt-14">
          <h3 className="max-w-xl font-display text-subtitulo">¿Una web y un asistente así para su clínica?</h3>
          <p className="mt-4 max-w-xl text-lead text-pearl/80">
            Esta página es una demostración que armó Jhon Escobar: la web, la agenda y el asistente que
            atiende. Si tiene una clínica o un consultorio, hablemos de cómo se vería el suyo.
          </p>
          {contactoHref ? (
            <BotonFlecha href={contactoHref} variante="claro" className="mt-7 gap-3 py-2.5 pl-6 pr-2.5 text-sm">
              Escribirle a Jhon por WhatsApp
            </BotonFlecha>
          ) : (
            <p className="mt-6 text-cuerpo text-pearl/70">Pídale el contacto de Jhon a quien le envió este enlace.</p>
          )}
        </div>
      </div>
    </section>
  );
}
