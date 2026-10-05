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

    // Solo se esconde lo que está bajo el pliegue: lo que ya se ve al cargar no parpadea. Primero se
    // leen todas las posiciones y después se escribe: alternar lectura y escritura en el mismo bucle
    // obliga al navegador a recalcular el layout en cada vuelta (forced reflow).
    const alto = window.innerHeight;
    const bajoPliegue = [...document.querySelectorAll<HTMLElement>("[data-aparecer]")].filter(
      (el) => el.getBoundingClientRect().top > alto,
    );
    for (const el of bajoPliegue) {
      el.classList.add("oculto");
      io.observe(el);
    }

    return () => io.disconnect();
  }, []);

  return null;
}
