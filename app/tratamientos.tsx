import Image from "next/image";
import type { CSSProperties } from "react";
import { BotonFlecha } from "./boton";
import { Carrusel } from "./carrusel";

// Textos alineados con projects/voice-agent-clinica/knowledge-base.md: diseño y carillas pasan por
// un especialista, el blanqueamiento requiere limpieza previa, y no se dice ningún precio.
const TRATAMIENTOS = [
  {
    titulo: "Diseño de sonrisa",
    texto:
      "Planeamos la forma, el tamaño y el color de sus dientes para que la sonrisa se vea natural y a su medida.",
    foto: "/img/tratamiento-diseno-2.jpg",
    alt: "Hombre sonriendo a la cámara con calma",
  },
  {
    titulo: "Carillas",
    texto:
      "Láminas finas de porcelana sobre la cara visible del diente. En la valoración le decimos si son una opción para usted.",
    // Provisional: Jhon prefiere ver las carillas en una sonrisa, no como objeto.
    foto: "/img/tratamiento-carillas-3.png",
    alt: "Seis carillas de porcelana sobre una superficie de piedra oscura",
  },
  {
    titulo: "Blanqueamiento",
    texto:
      "Aclara el color de sus dientes sin cambiar su forma. Antes se hace una limpieza dental.",
    foto: "/img/tratamiento-blanqueamiento-2.jpg",
    alt: "Mujer de cabello canoso sonriendo a la cámara",
  },
  {
    titulo: "Ortodoncia invisible",
    texto:
      "Alineadores transparentes para ordenar los dientes sin brackets a la vista. La valoración de ortodoncia es gratuita.",
    foto: "/img/tratamiento-ortodoncia.jpg",
    alt: "Mano sosteniendo un alineador dental transparente",
  },
];

export function Tratamientos() {
  return (
    <section id="tratamientos" className="px-5 py-16 md:px-10 md:py-24">
      <div data-aparecer="subir" className="max-w-2xl">
        <h2 className="font-display text-titulo">Qué podemos hacer por su sonrisa</h2>
        <p className="mt-4 text-lead text-muted">
          Cada caso se revisa primero en la valoración gratuita. Ahí le decimos qué le conviene y qué no.
        </p>
      </div>

      {/* Móvil: slider centrado con flechas. Escritorio: 4 columnas. Cada tarjeta aparece por sí sola
          (escalonada) para que las del slider lo hagan al deslizar. */}
      <Carrusel etiqueta="Tratamientos">
        {TRATAMIENTOS.map((t, i) => (
          <li
            key={t.titulo}
            data-aparecer="subir"
            className="group w-[var(--ancho)] shrink-0 snap-center md:w-auto"
            style={{ "--i": i } as CSSProperties}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-line">
              <Image
                src={t.foto}
                alt={t.alt}
                fill
                sizes="(min-width: 768px) 25vw, 72vw"
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-4 text-card font-medium tracking-[-.02em]">{t.titulo}</h3>
            <p className="mt-1.5 text-cuerpo text-muted">{t.texto}</p>
          </li>
        ))}
      </Carrusel>

      <BotonFlecha href="#agendar" variante="oscuro" data-aparecer="subir" className="mt-12 gap-3 py-2.5 pl-6 pr-2.5 text-sm md:mt-16">
        Agende su valoración gratuita
      </BotonFlecha>
    </section>
  );
}
