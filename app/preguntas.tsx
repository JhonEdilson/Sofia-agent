// Cada respuesta empieza por la respuesta. Todo sale de la KB de Sofía (knowledge-base.md): si algo cambia
// allá, cambia aquí, o Sofía y la página se contradirán.
const PREGUNTAS = [
  {
    p: "¿Cuánto cuesta la valoración?",
    r: "Nada: es gratuita y dura 30 minutos. El valor de cada tratamiento depende de su caso y se lo explicamos ahí, sin compromiso. El único valor fijo hoy es el de la limpieza dental: 150.000 COP.",
  },
  {
    p: "¿Qué debo llevar a la primera cita?",
    r: "Su documento de identidad. Si tiene radiografías o historia odontológica de otro lugar, tráigalas también.",
  },
  {
    p: "¿Atienden por EPS o prepagada?",
    r: "No, la clínica es particular. Se paga directamente y se entrega factura. Recibimos efectivo, tarjeta débito y crédito, y transferencia.",
  },
  {
    p: "¿Puedo pagar por cuotas?",
    r: "Los tratamientos largos, como la ortodoncia, se pueden pagar en cuotas mensuales que se acuerdan en la valoración.",
  },
  {
    p: "¿Atienden niños?",
    r: "Sí, desde los 6 años. Los menores de 18 años siempre vienen con un adulto acompañante.",
  },
  {
    p: "¿Puedo cambiar o cancelar mi cita?",
    r: "Sí, con al menos 4 horas de anticipación. Hable con Sofía y ella deja el aviso a recepción. Si llega más de 15 minutos tarde, la cita se reprograma.",
  },
  {
    p: "¿Puedo ir sin cita?",
    r: "Solo por una urgencia por dolor, y aun así conviene avisar antes para confirmar que hay un hueco. Si tiene sangrado que no para, un golpe fuerte en la cara o dificultad para tragar o respirar, vaya de inmediato a un servicio de urgencias.",
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="px-5 md:px-10">
      <div className="grid gap-10 border-t border-line py-16 md:grid-cols-[1fr_1.6fr] md:gap-16 md:py-24">
        <h2 data-aparecer="subir" className="font-display text-titulo">
          Lo que más nos preguntan
        </h2>

        <div data-aparecer="fundir">
          {PREGUNTAS.map((q, i) => (
            // `name` hace el grupo exclusivo: al abrir una, se cierra la otra. La primera arranca abierta.
            <details key={q.p} name="faq" open={i === 0} className="group border-b border-line first:border-t">
              <summary className="group/pregunta flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lead font-medium outline-offset-4 outline-ink focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
                {q.p}
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-hover/pregunta:border-ink group-hover/pregunta:bg-ink group-hover/pregunta:text-pearl"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-xl pb-6 text-cuerpo text-muted">{q.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
