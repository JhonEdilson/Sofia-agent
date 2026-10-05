"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  ConversationProvider,
  useConversationControls,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import { interpretarEvento, type EventoTool } from "@/lib/eventos-sofia";
import { useDemo } from "./demo-estado";
import { Vista } from "./sofia";

// Todo lo que necesita el SDK de ElevenLabs (y LiveKit debajo, ~500 KB) vive en este archivo, que
// sofia.tsx carga con import() dinámico: así no viaja en el JavaScript inicial de la página.

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

  // Este panel solo se monta cuando la persona ya presionó "Hablar con Sofía" en la vista de sofia.tsx,
  // así que arranca solo, sin pedir un segundo clic. El ref evita abrir dos sesiones con el doble
  // montaje de StrictMode en desarrollo.
  const arrancado = useRef(false);
  const alMontar = useEffectEvent(() => void hablar());
  useEffect(() => {
    if (arrancado.current) return;
    arrancado.current = true;
    alMontar();
  }, []);

  return (
    <Vista
      conectada={conectada}
      conectando={conectando}
      hablando={conectada && isSpeaking}
      fallo={fallo || caida}
      onBoton={conectada ? endSession : hablar}
      enfocar
    />
  );
}

// Una sesión que termina sin que el visitante la cierre y dura menos de esto es una falla de arranque,
// no una conversación que acabó: con la cuenta sin créditos ElevenLabs crea la sala y la cierra a los
// 1 o 3 s, y el SDK lo reporta como `reason: "agent"`, igual que una colgada normal del agente.
const FALLA_SI_DURA_MENOS_DE_MS = 15000;

export function SesionSofia() {
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
