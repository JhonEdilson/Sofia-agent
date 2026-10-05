"use client";

import { useEffect, useRef, useState } from "react";
import { BotonFlecha } from "./boton";

const NAV = [
  ["Tratamientos", "#tratamientos"],
  ["Proceso", "#proceso"],
  ["Preguntas", "#preguntas"],
  ["Horario", "#horario"],
] as const;

// Navegación fija. Transparente sobre el hero; sólida cuando el hero sale de pantalla.
// Un IntersectionObserver (y no animation-timeline) porque si el navegador no soporta el
// segundo, la barra quedaría transparente con texto blanco sobre secciones claras.
// En móvil los cuatro enlaces viven en un menú de pantalla completa con las opciones centradas.
export function Nav() {
  const [sobreContenido, setSobreContenido] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    // rootMargin = alto de la barra en escritorio: cambia justo cuando el hero deja de estar debajo de ella.
    const io = new IntersectionObserver(([e]) => setSobreContenido(!e.isIntersecting), {
      rootMargin: "-84px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Con el menú abierto: la página de atrás no se desplaza, Esc lo cierra, Tab da vueltas solo dentro
  // del menú, y si la ventana pasa a escritorio se cierra solo.
  useEffect(() => {
    if (!abierto) return;
    document.documentElement.style.overflow = "hidden";
    const escritorio = window.matchMedia("(min-width: 768px)");
    const alCambiar = () => {
      if (escritorio.matches) setAbierto(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (f.length === 0) return;
      const primero = f[0];
      const ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    escritorio.addEventListener("change", alCambiar);
    document.addEventListener("keydown", alTeclear);
    // El panel arranca con visibility:hidden y en la transición ese valor es discreto: en el primer
    // instante sigue "oculto" y un elemento oculto no puede recibir foco. Se espera un momento.
    const esperaFoco = window.setTimeout(() => botonCerrar.current?.focus(), 60);
    return () => {
      window.clearTimeout(esperaFoco);
      document.documentElement.style.overflow = "";
      escritorio.removeEventListener("change", alCambiar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  // Al elegir un enlace el menú se cierra y el navegador salta a la sección: el foco no se devuelve al
  // botón, porque el destino del ancla es quien debe recibirlo.
  const alElegir = () => setAbierto(false);

  return (
    // El margen negativo iguala el alto de la barra: queda en el flujo (sticky funciona)
    // y el hero se desliza debajo, idéntico a cuando la barra era parte del hero.
    // Sin desenfoque: al 95 % de opacidad no aportaba nada y costaba pintado.
    <header
      className={`sticky top-0 z-50 -mb-[76px] flex h-[76px] shrink-0 items-center justify-between gap-3 border-b px-5 text-pearl transition-[background-color,border-color] duration-300 md:-mb-[84px] md:h-[84px] md:px-10 ${
        sobreContenido ? "border-white/10 bg-ink/95" : "border-transparent bg-transparent"
      }`}
    >
      <a
        href="#inicio"
        className="font-display text-[22px] transition-opacity duration-300 hover:opacity-70 md:text-[27px]"
      >
        Sonrisa Viva
      </a>

      <nav aria-label="Principal" className="hidden gap-[34px] md:flex">
        {NAV.map(([texto, href]) => (
          <a key={href} href={href} className="enlace-sub text-[13px] font-semibold uppercase tracking-[.12em]">
            {texto}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        {/* En móvil el botón dice "Agendar": el ancho se reparte entre logo, botón y menú sin apretarse. */}
        <BotonFlecha
          href="#agendar"
          variante="claro"
          className="gap-2.5 py-2 pl-4 pr-2 text-[13px] md:gap-3 md:py-[9px] md:pl-[22px] md:pr-[9px] md:text-sm"
        >
          <span className="md:hidden">Agendar</span>
          <span className="hidden md:inline">Agende su valoración</span>
        </BotonFlecha>

        <button
          ref={botonMenu}
          type="button"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto(true)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-pearl/30 transition-colors duration-300 hover:bg-pearl/10 md:hidden"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 7h14M3 13h14" />
          </svg>
        </button>
      </div>

      {/* Menú móvil: cubre todo el ancho y alto, opciones centradas. `inert` mientras está cerrado para que
          sus enlaces no entren en el orden de tabulación. */}
      <div
        id="menu-movil"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        inert={!abierto}
        className={`fixed inset-0 z-[60] flex h-dvh flex-col bg-ink text-pearl transition-[opacity,visibility] duration-300 md:hidden ${
          abierto ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between px-5">
          <a href="#inicio" onClick={alElegir} className="font-display text-[22px]">
            Sonrisa Viva
          </a>
          <button
            ref={botonCerrar}
            type="button"
            aria-label="Cerrar menú"
            onClick={() => {
              setAbierto(false);
              botonMenu.current?.focus();
            }}
            className="flex size-11 items-center justify-center rounded-full border border-pearl/30 transition-colors duration-300 hover:bg-pearl/10"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <nav aria-label="Principal (móvil)" className="flex flex-1 flex-col items-center justify-center gap-7 px-5 text-center">
          {NAV.map(([texto, href], i) => (
            <a
              key={href}
              href={href}
              onClick={alElegir}
              style={{ transitionDelay: abierto ? `${120 + i * 70}ms` : "0ms" }}
              className={`font-display text-[clamp(2.25rem,10vw,3.25rem)] leading-none transition-[opacity,transform] duration-500 ease-[var(--ease)] hover:opacity-70 ${
                abierto ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {texto}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4 px-5 pb-10">
          <BotonFlecha
            href="#agendar"
            variante="claro"
            onClick={alElegir}
            className="gap-3 py-2.5 pl-6 pr-2.5 text-sm"
          >
            Agende su valoración
          </BotonFlecha>
          <p className="text-nota text-demo-text">Demo de portafolio · clínica ficticia</p>
        </div>
      </div>
    </header>
  );
}
