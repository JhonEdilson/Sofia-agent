# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos lectores con dos trabajos distintos sobre la misma página.

- **Paciente (en la ficción).** Persona en Medellín que evalúa un tratamiento estético dental (diseño de sonrisa, carillas, blanqueamiento, ortodoncia invisible). Suele llegar con miedo o desconfianza, desde el celular, y quiere saber quién lo atiende y agendar sin tener que llamar. Su única acción: agendar la valoración gratuita de 30 minutos.
- **Dueño o dueña de clínica, o cliente de Upwork (en la realidad).** Recibe el link de Jhon por WhatsApp o LinkedIn y lo juzga en segundos desde el celular. Juega a ser paciente: usa el formulario o habla con Sofía, ve llegar la cita y el aviso a recepción, y debe concluir "quiero esto para mi clínica" y contactar a Jhon.

## Product Purpose

Demo de portafolio de Jhon Escobar: landing one-page de una clínica ficticia (Clínica Odontológica Sonrisa Viva, El Poblado, Medellín) que demuestra a la vez diseño web y un agente que atiende y agenda. Éxito: el paciente agenda la valoración gratuita, y el dueño de clínica escribe a Jhon.

## Positioning

Una web de clínica cuya única conversión se completa por dos puertas, el formulario o una conversación con Sofía por voz o texto, que escriben en el mismo calendario real, con aviso a recepción cuando hace falta una persona. Una agencia de diseño no entrega el agente; una herramienta de agenda no entrega la web.

## Operating Context

- Se difunde como link por WhatsApp y LinkedIn: móvil primero y vista previa del enlace (og:image, og:title) importan.
- Horario de la clínica ficticia: lunes a viernes 7:00 a 18:00, sábado 8:00 a 13:00, domingo y festivos cerrado. Valoración inicial de 30 minutos. Zona horaria America/Bogota.
- El agente de voz y texto es Sofía (ElevenLabs), la "asistente virtual" de la clínica. La agenda vive en un Google Calendar compartido entre el formulario y el agente.

## Capabilities and Constraints

- Todo lo de la clínica es ficticio y debe estar rotulado como demo donde un visitante pueda confundirlo con real.
- Sofía siempre se declara asistente virtual, también si le preguntan si es persona (guardarraíl 8 de su prompt).
- Sin claims médicos, testimonios, cifras ni registros profesionales inventados. Ley 35 de 1989, art. 53: nada que induzca a error.
- Stack ya existente: Next 16 + Tailwind 4 + `@elevenlabs/react`, despliegue en Vercel Hobby (demo propio, no sitio de cliente), repo público.
- Reprogramar y cancelar quedan fuera del alcance de la agenda del formulario; el agente avisa a recepción.
- Créditos de ElevenLabs en plan Free; el agente puede quedar sin cupo y la página debe degradar a formulario sin romperse.
- Contacto de Jhon: WhatsApp, número en variable de entorno (el repo es público). Enlace con formato `wa.me` y mensaje prellenado. Por decidir: texto del mensaje.

## Brand Commitments

- Nombre: Clínica Odontológica Sonrisa Viva.
- Español, **trato de usted en todo**, coherente con el first message ya publicado del agente ("Le habla Sofía").
- Capa meta declarada por Jhon: barra superior "Demo de portafolio" con acceso a su WhatsApp, y una sección final "Lo que acaba de pasar por dentro" que muestra la cita creada y el aviso a recepción.
- Las fotos las genera Jhon con IA siguiendo un brief; stock gratis queda como respaldo.
- Descartado por el cliente (2026-10-04): la tipografía Fraunces y la paleta crema, terracota y espresso de la v1 del moodboard. Preferencias vinculantes: hero con foto a pantalla completa, y el resultado debe verse premium y limpio/moderno (no artesanal ni recargado).

## Evidence on Hand

- Base de conocimiento de la clínica: `projects/voice-agent-clinica/knowledge-base.md` (servicios, duraciones, precios, horario, dirección ficticia). Se reposiciona a estética.
- Prompt y first message del agente: `projects/voice-agent-clinica/system-prompt-es.md`.
- Ausentes y que no se fabrican: fotos reales, equipo, reseñas, cifras de ahorro o de conversión, registro profesional.

## Product Principles

1. Una sola acción, dos puertas: agendar la valoración, por formulario o hablando con Sofía.
2. La IA se muestra honesta: nombre, rótulo de asistente virtual y micrófono solo tras un gesto del usuario.
3. La ficción siempre rotulada: nada que parezca real y engañoso.
4. Móvil primero, porque el link llega por WhatsApp.
5. Un calendario, cero doble cita: lo que reserva el agente desaparece del formulario y viceversa.

## Accessibility & Inclusion

WCAG AA como mínimo. Respetar `prefers-reduced-motion`. El micrófono solo se pide tras un gesto del usuario, y siempre hay una alternativa sin voz (formulario o chat de texto).
