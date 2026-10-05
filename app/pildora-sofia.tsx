"use client";

import { useEffect, useState } from "react";
import { OrbeMini } from "./orbe-mini";

// Píldora flotante que lleva al panel de Sofía. Existe para que quien juzga la demo en segundos (el dueño
// de clínica) vea que hay un agente desde el primer scroll, no solo al llegar a la agenda. Solo se ve
// entre el hero (ahí ya está la tarjeta de Sofía) y la agenda (ahí está el panel completo). Después de
// la agenda vienen la sección oscura, donde tinta sobre tinta no se ve, y el pie, donde taparía "Volver
// arriba". Es un enlace, no abre la sesión: el SDK se precarga solo al acercarse al panel (sofia.tsx).
export function PildoraSofia() {
  const [enHero, setEnHero] = useState(true);
  const [antesDeAgenda, setAntesDeAgenda] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const agenda = document.getElementById("agendar");
    if (!hero || !agenda) return;
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === hero) setEnHero(e.isIntersecting);
        // Fuera de pantalla con el borde superior abajo = todavía no se llega; arriba = ya se pasó.
        else setAntesDeAgenda(!e.isIntersecting && e.boundingClientRect.top > 0);
      }
    });
    io.observe(hero);
    io.observe(agenda);
    return () => io.disconnect();
  }, []);

  const visible = !enHero && antesDeAgenda;

  return (
    <a
      href="#sofia"
      // inert: escondida no recibe foco ni la anuncia el lector de pantalla.
      inert={!visible}
      className={`fixed bottom-4 right-4 z-40 inline-flex items-center gap-2.5 rounded-full bg-ink py-2 pl-2 pr-4 text-sm font-bold text-pearl shadow-[0_8px_24px_rgba(8,10,9,.28)] transition-[opacity,translate] duration-500 ease-[var(--ease)] md:bottom-6 md:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <OrbeMini className="bg-pearl" barra="bg-ink" />
      Hablar con Sofía
    </a>
  );
}
