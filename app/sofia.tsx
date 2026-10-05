"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Barras del orbe: altura en reposo (--h) y desfase de la onda cuando Sofía habla.
const BARRAS = [
  { h: 0.35, d: "0s" },
  { h: 0.7, d: "0.15s" },
  { h: 0.5, d: "0.3s" },
  { h: 1, d: "0.1s" },
  { h: 0.6, d: "0.25s" },
];

function Orbe({ hablando, activa }: { hablando: boolean; activa: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`orbe flex size-24 items-center justify-center gap-1.5 rounded-full bg-pearl ${
        hablando ? "orbe-hablando" : activa ? "" : "orbe-reposo"
      }`}
    >
      {BARRAS.map((b, i) => (
        <i
          key={i}
          className="orbe-barra block h-9 w-1 rounded-full bg-ink"
          style={{ "--h": b.h, animationDelay: b.d } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

// Lo que se ve del panel. Sin estado propio: la usa tanto la vista en reposo de abajo (antes de cargar el
// SDK) como el panel conectado de sofia-sesion.tsx, así las dos se ven idénticas y no hay salto al cargar.
export function Vista({
  conectada = false,
  conectando = false,
  hablando = false,
  fallo = false,
  onBoton,
  enfocar = false,
}: {
  conectada?: boolean;
  conectando?: boolean;
  hablando?: boolean;
  fallo?: boolean;
  onBoton?: () => void;
  // Al pasar de la vista en reposo al panel conectado, React reemplaza el botón y el foco del teclado
  // caería al <body>. El panel conectado lo pide de vuelta al montarse.
  enfocar?: boolean;
}) {
  const estado = conectando
    ? "Conectando…"
    : conectada
      ? hablando
        ? "Sofía está hablando"
        : "Sofía le escucha"
      : "";

  return (
    <div className="flex h-full flex-col">
      <Orbe hablando={hablando} activa={conectada || conectando} />
      <h3 className="mt-6 text-dato font-medium tracking-[-.02em]">Hable con Sofía</h3>
      <p className="mt-1 text-sm font-semibold text-pearl/70">Asistente virtual de la clínica</p>
      <p className="mt-4 max-w-sm text-cuerpo text-pearl/85">
        Le puede contar horarios y agendar su valoración por usted, también de noche. Hable como si
        llamara a la clínica.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBoton}
          disabled={conectando}
          autoFocus={enfocar}
          className="group inline-flex items-center gap-2.5 rounded-full border border-pearl bg-pearl py-2.5 pl-6 pr-2.5 text-sm font-bold text-ink transition-[color,background-color,transform] duration-300 hover:bg-transparent hover:text-pearl active:scale-[.97] disabled:opacity-60"
        >
          {conectada ? "Terminar la conversación" : "Hablar con Sofía"}
          <span className="flex size-[26px] items-center justify-center rounded-full bg-ink text-pearl transition-colors duration-300 group-hover:bg-pearl group-hover:text-ink">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {conectada ? <path d="M4 4l8 8M12 4l-8 8" /> : <path d="M8 2.5a2 2 0 0 0-2 2V8a2 2 0 0 0 4 0V4.5a2 2 0 0 0-2-2ZM4 7.5a4 4 0 0 0 8 0M8 11.5v2" />}
            </svg>
          </span>
        </button>
        <span role="status" className="text-sm text-pearl/85">
          {estado}
        </span>
      </div>

      {/* Cubre dos fallos distintos con un mismo mensaje, sin detalles técnicos: no se pudo pedir el token
          o la sesión se cayó sola al arrancar (p. ej. sin créditos). */}
      {fallo && (
        <p role="alert" className="mt-4 rounded-xl bg-pearl/10 p-3 text-cuerpo">
          Sofía no pudo atenderle esta vez. Puede agendar con el formulario, que usa el mismo calendario.
        </p>
      )}

      <p className="mt-auto pt-8 text-nota text-pearl/70">
        Sofía es una inteligencia artificial, no una persona. El micrófono se activa solo cuando usted
        presiona el botón, y su voz se procesa en la plataforma ElevenLabs.
      </p>
    </div>
  );
}

// El SDK de voz pesa ~500 KB y casi nadie lo usa en los primeros segundos: se baja aparte. import() es
// idempotente, así que la precarga de abajo y el dynamic() comparten la misma descarga.
const cargarSesion = () => import("./sofia-sesion");
const SesionSofia = dynamic(() => cargarSesion().then((m) => m.SesionSofia), {
  // Solo se ve si la persona hace clic antes de que termine la precarga.
  loading: () => <Vista conectando />,
});

export function PanelSofia() {
  const [iniciada, setIniciada] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Precarga cuando el panel se acerca a la pantalla: llega después del hero (no compite con la foto
  // principal) y antes del clic, así que al presionar el botón la sesión arranca sin espera.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        void cargarSesion();
        io.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (iniciada) return <SesionSofia />;
  return (
    <div ref={ref} className="h-full">
      <Vista onBoton={() => setIniciada(true)} />
    </div>
  );
}
