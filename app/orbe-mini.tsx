// Orbe de voz de Sofía en pequeño (tarjeta del hero y píldora flotante). Estático: el orbe que reacciona
// al audio es el del panel de sofia.tsx.
export function OrbeMini({ className = "bg-ink", barra = "bg-pearl" }: { className?: string; barra?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-[22px] shrink-0 items-center justify-center gap-0.5 rounded-full ${className}`}
    >
      {[6, 12, 8, 13].map((h, i) => (
        <i key={i} className={`block w-0.5 rounded-[1px] ${barra}`} style={{ height: h }} />
      ))}
    </span>
  );
}
