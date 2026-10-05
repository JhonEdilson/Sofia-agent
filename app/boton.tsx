import { Flecha } from "./flecha";

// Botón en píldora con círculo y flecha: el CTA de la página. En reposo la flecha apunta a la derecha;
// al pasar el cursor o enfocar, gira hasta la diagonal y la píldora invierte fondo y color de texto.
// `claro` = sobre fondos oscuros o foto; `oscuro` = sobre la hoja clara.
const VARIANTES = {
  claro: {
    boton: "border-pearl bg-pearl text-ink hover:bg-transparent hover:text-pearl focus-visible:bg-transparent focus-visible:text-pearl",
    circulo: "bg-ink text-pearl group-hover:bg-pearl group-hover:text-ink group-focus-visible:bg-pearl group-focus-visible:text-ink",
  },
  oscuro: {
    boton: "border-ink bg-ink text-pearl hover:bg-transparent hover:text-ink focus-visible:bg-transparent focus-visible:text-ink",
    circulo: "bg-pearl text-ink group-hover:bg-ink group-hover:text-pearl group-focus-visible:bg-ink group-focus-visible:text-pearl",
  },
} as const;

export function BotonFlecha({
  href,
  variante,
  className = "",
  children,
  ...resto
}: {
  href: string;
  variante: keyof typeof VARIANTES;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<"a">, "href" | "className" | "children">) {
  const v = VARIANTES[variante];
  return (
    <a
      href={href}
      {...resto}
      className={`group inline-flex items-center rounded-full border font-bold transition-[color,background-color,transform] duration-300 active:scale-[.97] ${v.boton} ${className}`}
    >
      {children}
      <span
        className={`flex size-[26px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${v.circulo}`}
      >
        <Flecha className="size-3.5 rotate-45 transition-transform duration-500 ease-[var(--ease)] group-hover:rotate-0 group-focus-visible:rotate-0" />
      </span>
    </a>
  );
}
