"use client";

import { useEffect } from "react";

// Hace aparecer con el scroll todo lo marcado con `data-aparecer` (ver globals.css). Un solo observador,
// una sola vez por elemento. Es IntersectionObserver y no `animation-timeline` a propósito: funciona en
// cualquier navegador, y si el JavaScript falla el contenido ya está visible, nunca queda oculto.
export function Aparecer() {
  useEffect(() => {
    // Con movimiento reducido no se esconde nada: el contenido está donde debe desde el primer pintado.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("visto");
          io.unobserve(e.target);
        }
      },
      // Se dispara un poco antes de que el bloque toque el borde inferior, para que no entre tarde.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const el of document.querySelectorAll<HTMLElement>("[data-aparecer]")) {
      // Solo se esconde lo que está bajo el pliegue: lo que ya se ve al cargar no parpadea.
      if (el.getBoundingClientRect().top <= window.innerHeight) continue;
      el.classList.add("oculto");
      io.observe(el);
    }

    return () => io.disconnect();
  }, []);

  return null;
}
