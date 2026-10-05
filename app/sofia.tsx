"use client";

import { useRef, useState } from "react";
import {
  ConversationProvider,
  useConversationControls,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import { interpretarEvento, type EventoTool } from "@/lib/eventos-sofia";
import { useDemo } from "./demo-estado";

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

function Panel({ caida, alIniciar }: { caida: boolean; alIniciar: () => void }) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();
  const [fallo, setFallo] = useState(false);

  const conectada = status === "connected";
  const conectando = status === "connecting";

  // El micrófono se pide aquí, tras el clic: nunca al cargar la página.
  async function hablar() {
    setFallo(false);
    alIniciar(); // borra un aviso anterior y marca la hora de inicio de este intento
    try {
      // El token se pide en cada inicio: es de corta vida y la API key nunca sale del servidor.
      const res = await fetch("/api/token");
      if (!res.ok) throw new Error(`token ${res.status}`);
      const { token } = await res.json();
      startSession({ conversationToken: token });
    } catch (e) {
      console.error("sofia", e);
      setFallo(true);
    }
  }

  const estado = conectando
    ? "Conectando…"
    : conectada
      ? isSpeaking
        ? "Sofía está hablando"
        : "Sofía le escucha"
      : "";

  return (
    <div className="flex h-full flex-col">
      <Orbe hablando={conectada && isSpeaking} activa={conectada || conectando} />
      <h3 className="mt-6 text-dato font-medium tracking-[-.02em]">Hable con Sofía</h3>
      <p className="mt-1 text-sm font-semibold text-pearl/70">Asistente virtual de la clínica</p>
      <p className="mt-4 max-w-sm text-cuerpo text-pearl/85">
        Le puede contar horarios y agendar su valoración por usted, también de noche. Hable como si
        llamara a la clínica.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={conectada ? endSession : hablar}
          disabled={conectando}
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
          (`fallo`) o la sesión se cayó sola al arrancar (`caida`, p. ej. sin créditos). */}
      {(fallo || caida) && (
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

// Una sesión que termina sin que el visitante la cierre y dura menos de esto es una falla de arranque,
// no una conversación que acabó: con la cuenta sin créditos ElevenLabs crea la sala y la cierra a los
// 1 o 3 s, y el SDK lo reporta como `reason: "agent"`, igual que una colgada normal del agente.
const FALLA_SI_DURA_MENOS_DE_MS = 15000;

export function PanelSofia() {
  const { registrarCita, registrarAviso } = useDemo();
  const [caida, setCaida] = useState(false);
  const inicio = useRef(0);
  return (
    <ConversationProvider
      // Cada evento de tool pasa por interpretarEvento (probado en lib/): un error de la tool nunca
      // se muestra como cita creada o aviso enviado.
      onAgentToolResponse={(evento) => {
        const r = interpretarEvento(evento as unknown as EventoTool);
        if (r?.tipo === "cita") registrarCita({ id: r.id, origen: "sofia", inicio: r.inicio, titulo: r.titulo });
        else if (r?.tipo === "aviso") registrarAviso(r.id);
      }}
      onError={(error) => console.error("conversation error", error)}
      onDisconnect={(d) => {
        if (d.reason !== "user" && Date.now() - inicio.current < FALLA_SI_DURA_MENOS_DE_MS) setCaida(true);
      }}
    >
      <Panel
        caida={caida}
        alIniciar={() => {
          setCaida(false);
          inicio.current = Date.now();
        }}
      />
    </ConversationProvider>
  );
}
