"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flecha } from "./flecha";

const DURACION = 700; // ms que tarda una tarjeta en pasar a la siguiente

// easeInOutCubic: arranca y frena despacio; a mitad de camino va más rápido. t va de 0 a 1.
const suavizar = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Slider de las tarjetas de tratamientos. En móvil es un carrusel con imán al centro (se arrastra con el
// dedo) y flechas atrás/adelante centradas debajo; desde `md` es una cuadrícula de 4 y las flechas se van.
// Cada tarjeta mide --ancho y el relleno lateral de la lista es justo el que deja centrada la primera y
// la última, así que cualquiera queda centrada al soltar. El `+20px` compensa el sangrado `-mx-5`: un
// padding en % se mide contra el ancho del PADRE, y la lista es 40 px más ancha que él (20 por lado).
export function Carrusel({ children, etiqueta }: { children: React.ReactNode; etiqueta: string }) {
  const lista = useRef<HTMLUListElement>(null);
  const [extremos, setExtremos] = useState({ inicio: true, fin: false });

  const medir = useCallback(() => {
    const el = lista.current;
    if (!el) return;
    setExtremos({
      inicio: el.scrollLeft < 8,
      fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    el.addEventListener("scroll", medir, { passive: true });
    // ResizeObserver avisa una vez al empezar a observar: eso da el estado inicial sin llamar setState
    // dentro del efecto, y además se actualiza si la ventana cambia de tamaño.
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      ro.disconnect();
    };
  }, [medir]);

  // Animación propia en vez de scrollBy({ behavior: "smooth" }): el navegador decide su duración y curva
  // (~300 ms, arranque seco) y además pelea con el imán. Aquí dura DURACION ms con aceleración y frenado
  // suaves, con el imán apagado durante el trayecto y reactivado al llegar.
  const cuadro = useRef<number | null>(null);
  const destino = useRef<number | null>(null);

  const detener = useCallback(() => {
    if (cuadro.current !== null) cancelAnimationFrame(cuadro.current);
    cuadro.current = null;
    destino.current = null;
    if (lista.current) lista.current.style.scrollSnapType = ""; // vuelve al imán del CSS
  }, []);

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    // Si la persona toca, arrastra o usa la rueda a mitad de la animación, se le cede el control.
    el.addEventListener("pointerdown", detener);
    el.addEventListener("touchstart", detener, { passive: true });
    el.addEventListener("wheel", detener, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", detener);
      el.removeEventListener("touchstart", detener);
      el.removeEventListener("wheel", detener);
      detener();
    };
  }, [detener]);

  function mover(dir: 1 | -1) {
    const el = lista.current;
    if (!el) return;
    // Un paso = una tarjeta más el hueco (gap-4 = 16 px). Si ya hay una animación en curso, el nuevo paso
    // se suma a donde iba, así dos toques seguidos avanzan dos tarjetas en vez de uno.
    const paso = (el.querySelector("li")?.getBoundingClientRect().width ?? el.clientWidth) + 16;
    const maximo = el.scrollWidth - el.clientWidth;
    const meta = Math.max(0, Math.min(maximo, (destino.current ?? el.scrollLeft) + dir * paso));
    const salida = el.scrollLeft;
    const distancia = meta - salida;
    if (Math.abs(distancia) < 1) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollTo({ left: meta, behavior: "auto" });
      return;
    }

    if (cuadro.current !== null) cancelAnimationFrame(cuadro.current);
    destino.current = meta;
    el.style.scrollSnapType = "none";
    const inicio = performance.now();
    const avanzar = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / DURACION);
      el.scrollLeft = salida + distancia * suavizar(t);
      if (t < 1) {
        cuadro.current = requestAnimationFrame(avanzar);
      } else {
        cuadro.current = null;
        destino.current = null;
        el.style.scrollSnapType = ""; // ya está sobre una posición de imán: no hay salto
      }
    };
    cuadro.current = requestAnimationFrame(avanzar);
  }

  const flecha =
    "flex size-11 items-center justify-center rounded-full border border-ink transition-[color,background-color,transform] duration-300 enabled:hover:bg-ink enabled:hover:text-pearl enabled:active:scale-95 disabled:opacity-30";

  return (
    <>
      <ul
        ref={lista}
        aria-label={etiqueta}
        className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[calc(50%+20px-var(--ancho)/2)] pb-2 [--ancho:min(72vw,20rem)] [scrollbar-width:none] md:mx-0 md:mt-14 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 md:pb-0"
      >
        {children}
      </ul>

      <div role="group" aria-label={`Controles de ${etiqueta.toLowerCase()}`} className="mt-5 flex items-center justify-center gap-3 md:hidden">
        <button type="button" aria-label="Anterior" disabled={extremos.inicio} onClick={() => mover(-1)} className={flecha}>
          <Flecha className="size-4 rotate-[225deg]" />
        </button>
        <button type="button" aria-label="Siguiente" disabled={extremos.fin} onClick={() => mover(1)} className={flecha}>
          <Flecha className="size-4 rotate-45" />
        </button>
      </div>
    </>
  );
}
