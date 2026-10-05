import Image from "next/image";
import type { CSSProperties } from "react";
import { Flecha } from "./flecha";
import { Agenda } from "./agenda";
import { Aparecer } from "./aparecer";
import { DemoProvider } from "./demo-estado";
import { Horario } from "./horario";
import { Nav } from "./nav";
import { OrbeMini } from "./orbe-mini";
import { PildoraSofia } from "./pildora-sofia";
import { Pie } from "./pie";
import { Preguntas } from "./preguntas";
import { Proceso } from "./proceso";
import { PorDentro } from "./por-dentro";
import { Tratamientos } from "./tratamientos";

// Mensaje provisional: el texto final lo decide Jhon (ver PRODUCT.md, "Capabilities and Constraints").
const MENSAJE_WHATSAPP =
  "Hola Jhon, vi la demo de Sonrisa Viva y quiero algo así para mi clínica.";

// El número vive en una variable de entorno porque el repo es público. Sin ella, la barra
// muestra el rótulo de demo y omite el botón en vez de apuntar a un número inventado.
function enlaceWhatsapp() {
  const numero = process.env.JHON_WHATSAPP;
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;
}

// Las tres tarjetas del primer scroll: al pasar el cursor se aclaran y su flecha se desplaza.
const tarjeta =
  "group relative flex flex-col gap-0.5 px-5 py-3 transition-colors duration-300 hover:bg-white focus-visible:bg-white md:h-[140px] md:justify-between md:px-[26px] md:py-5";

export default function Home() {
  const whatsapp = enlaceWhatsapp();

  return (
    <>
      {/* Capa meta: avisa que es una demo y da acceso a Jhon. */}
      {/* Alto fijo de 36 px y una sola línea: el hero resta exactamente esto de 100svh. */}
      <div className="flex h-9 shrink-0 items-center justify-center gap-3 overflow-hidden whitespace-nowrap px-4 text-nota text-demo-text">
        <span className="md:hidden">Demo · clínica ficticia</span>
        <span className="hidden md:inline">Demo de portafolio de Jhon Escobar, clínica ficticia</span>
        {whatsapp && (
          <a
            href={whatsapp}
            className="shrink-0 rounded-full border border-pearl bg-pearl px-3 py-1 text-[11px] font-bold text-ink transition-colors duration-300 hover:bg-transparent hover:text-pearl focus-visible:bg-transparent focus-visible:text-pearl"
          >
            ¿La quiere para su clínica?
          </a>
        )}
      </div>

      <Aparecer />
      <Nav />

      <main>
        {/* Primer frame: barra de demo (36 px) + hero = exactamente 100svh. Las tarjetas viven debajo. */}
        <section id="inicio" className="relative isolate flex h-[calc(100svh-36px)] min-h-[560px] flex-col justify-end overflow-hidden bg-demo">
          {/* Móvil: la foto ocupa el tramo superior y se funde a tinta, así el rostro queda libre
              entre la navegación y el texto. Escritorio: pantalla completa. */}
          <div className="hero-foto absolute inset-x-0 top-0 -z-20 h-[80%] [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] md:inset-0 md:h-auto md:[mask-image:none]">
            <Image
              src="/img/hero-sonrisa.jpg"
              alt="Mujer sonriendo a cámara, primer plano de su rostro"
              fill
              // Next 16 recomienda fetchPriority sobre `preload` para la imagen del LCP: el <img> ya
              // está en el HTML inicial, lo que faltaba era que el navegador la pidiera antes que el JS.
              // Sin `preload`, Next pone loading="lazy" por defecto: el eager es obligatorio aquí.
              fetchPriority="high"
              loading="eager"
              sizes="100vw"
              className="object-cover object-[70%_50%] md:object-[50%_50%]"
            />
          </div>
          {/* Velo: oscurece arriba para la navegación y abajo para el nombre. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,10,9,.5)_0,rgba(8,10,9,0)_170px),linear-gradient(0deg,rgba(8,10,9,.78)_0%,rgba(8,10,9,.3)_42%,rgba(8,10,9,.1)_100%)]"
          />

          <p style={{ "--retraso": "350ms" } as CSSProperties} className="hero-texto mx-4 mb-4 max-w-[300px] text-lead leading-[1.45] text-pearl [text-shadow:0_1px_14px_rgba(0,0,0,.45)] md:mx-0 md:mb-6 md:ml-[34px] md:max-w-[360px]">
            Diseño de sonrisa, carillas y blanqueamiento. Su primera valoración es gratuita.
          </p>

          <h1 style={{ "--retraso": "150ms" } as CSSProperties} className="hero-texto mx-4 mb-8 font-display text-[21vw] uppercase leading-[.9] text-pearl md:mx-0 md:mb-12 md:ml-[34px] md:whitespace-nowrap md:text-[min(10.4vw,190px)]">
            <span className="block md:inline">Sonrisa</span>{" "}
            <span className="block md:inline">Viva</span>
          </h1>
        </section>

        {/* Hoja que sube al hacer scroll: las tres puertas de la página y todas las secciones. El
            DemoProvider conecta el formulario y a Sofía con la sección "por dentro". */}
        <DemoProvider>
        <div className="mx-3 rounded-[26px] bg-sheet text-ink md:mx-6">
          <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            <a href="#agendar" className={`${tarjeta} rounded-t-[26px] md:rounded-t-none md:rounded-tl-[26px]`}>
              <small className="text-nota font-medium text-muted">Valoración gratuita</small>
              <Flecha className="absolute right-5 top-3.5 size-[18px] transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:right-6 md:top-[18px]" />
              <b className="text-destacado font-medium tracking-[-.025em]">
                30 minutos, sin compromiso
              </b>
            </a>
            <a href="#sofia" className={tarjeta}>
              <small className="flex items-center gap-2.5 text-nota font-medium text-muted">
                <OrbeMini />
                Sofía, asistente virtual
              </small>
              <Flecha className="absolute right-5 top-3.5 size-[18px] transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:right-6 md:top-[18px]" />
              <b className="text-destacado font-medium tracking-[-.025em]">
                Hable con ella ahora, también de noche
              </b>
            </a>
            <a href="#proceso" className={`${tarjeta} md:rounded-tr-[26px]`}>
              <small className="text-nota font-medium text-muted">Su primera visita</small>
              <Flecha className="absolute right-5 top-3.5 size-[18px] transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:right-6 md:top-[18px]" />
              <b className="text-destacado font-medium tracking-[-.025em]">
                Qué pasa, paso a paso
              </b>
            </a>
          </div>

          <Tratamientos />
          <Proceso />
          <Agenda contactoHref={whatsapp} />
          <Preguntas />
          <Horario />
          <PorDentro contactoHref={whatsapp} />
        </div>
        </DemoProvider>
      </main>
      <Pie contactoHref={whatsapp} />
      <PildoraSofia />
    </>
  );
}
