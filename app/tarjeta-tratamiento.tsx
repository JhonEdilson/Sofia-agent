"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties } from "react";
import { Flecha } from "./flecha";

export type Tratamiento = {
  titulo: string;
  texto: string;
  // Solo datos que también están en la KB de Sofía: si la web dice algo que ella no sabe, la demo se cae
  // en la primera pregunta del dueño de clínica.
  datos: string[];
  foto: string;
  alt: string;
};

// Una foto de la franja. En reposo es solo imagen y pie; al pasar el cursor, al enfocar con teclado o al
// tocarla en el celular, la foto se funde con la hoja y aparece el detalle. El detalle está siempre en el
// DOM (opacidad 0, no display:none), así que el lector de pantalla lo lee sin abrir nada.
export function TarjetaTratamiento({ t, i, total }: { t: Tratamiento; i: number; total: number }) {
  const [abierta, setAbierta] = useState(false);
  const id = useId();
  const numero = (n: number) => String(n).padStart(2, "0");

  return (
    <li
      data-aparecer="descubrir"
      data-abierta={abierta || undefined}
      className="group relative w-[82%] shrink-0 snap-start sm:w-[46%] md:w-[31%]"
      style={{ "--i": i } as CSSProperties}
    >
      <div className="franja-marco relative aspect-[3/4] overflow-hidden bg-line">
        <Image
          src={t.foto}
          alt={t.alt}
          fill
          sizes="(min-width: 768px) 31vw, (min-width: 640px) 46vw, 82vw"
          className="franja-foto object-cover"
        />

        {/* El toque en el celular: los navegadores táctiles no tienen hover y Safari no enfoca botones al
            tocarlos, así que el estado abierto vive en React. En escritorio el hover lo resuelve el CSS. */}
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={id}
          aria-label={`Ver detalles de ${t.titulo.toLowerCase()}`}
          onClick={() => setAbierta((a) => !a)}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-offset-[-6px]"
        />

        {/* pointer-events-none: un toque sobre el detalle cae en el botón de abajo y lo cierra; solo el
            enlace de agendar recibe el toque. */}
        <div
          id={id}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-sheet p-6 opacity-0 transition-opacity duration-500 ease-[var(--ease)] group-hover:opacity-100 group-focus-within:opacity-100 group-data-[abierta]:opacity-100 md:p-8"
        >
          <p className="text-cuerpo text-muted">{t.texto}</p>
          <ul className="mt-5 border-t border-line">
            {t.datos.map((d) => (
              <li key={d} className="border-b border-line py-2.5 text-cuerpo font-medium">
                {d}
              </li>
            ))}
          </ul>
          <a
            href="#agendar"
            className="enlace-sub pointer-events-auto mt-6 inline-flex items-center gap-2 self-start text-sm font-bold"
          >
            Agendar valoración
            <Flecha className="size-3.5" />
          </a>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4 px-4 md:px-5">
        <h3 className="text-nota font-semibold uppercase tracking-[.08em]">{t.titulo}</h3>
        {/* La posición es información real en una franja que se desliza; para el lector de pantalla la
            lista ya anuncia "elemento 1 de 4". */}
        <span aria-hidden="true" className="text-nota tabular-nums text-muted">
          {numero(i + 1)}/{numero(total)}
        </span>
      </div>
    </li>
  );
}
