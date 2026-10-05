import { Carrusel } from "./carrusel";
import { TarjetaTratamiento, type Tratamiento } from "./tarjeta-tratamiento";

// Textos alineados con projects/voice-agent-clinica/knowledge-base.md: diseño y carillas pasan por
// un especialista, el blanqueamiento requiere limpieza previa, y no se dice ningún precio. Los `datos`
// salen de la KB tal cual (duraciones y requisitos): no se agrega nada que Sofía no sepa.
const TRATAMIENTOS: Tratamiento[] = [
  {
    titulo: "Diseño de sonrisa",
    texto:
      "Planeamos la forma, el tamaño y el color de sus dientes para que la sonrisa se vea natural y a su medida.",
    datos: ["Lo revisa un especialista", "Empieza con la valoración gratuita"],
    foto: "/img/tratamiento-diseno-2.jpg",
    alt: "Hombre sonriendo a la cámara con calma",
  },
  {
    titulo: "Carillas",
    texto:
      "Láminas finas de porcelana sobre la cara visible del diente. En la valoración le decimos si son una opción para usted.",
    datos: ["Lo revisa un especialista", "Empieza con la valoración gratuita"],
    // Provisional: Jhon prefiere ver las carillas en una sonrisa, no como objeto.
    foto: "/img/tratamiento-carillas-3.png",
    alt: "Seis carillas de porcelana sobre una superficie de piedra oscura",
  },
  {
    titulo: "Blanqueamiento",
    texto:
      "Aclara el color de sus dientes sin cambiar su forma. Antes se hace una limpieza dental.",
    datos: ["Cita de 60 minutos", "Antes, una limpieza de 45 minutos"],
    foto: "/img/tratamiento-blanqueamiento-2.jpg",
    alt: "Mujer de cabello canoso sonriendo a la cámara",
  },
  {
    titulo: "Ortodoncia invisible",
    texto:
      "Alineadores transparentes para ordenar los dientes sin brackets a la vista. La valoración de ortodoncia es gratuita.",
    datos: ["Valoración de ortodoncia gratuita", "Controles de 20 minutos"],
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

      {/* Sin botón de agendar debajo: cada foto ya lleva el suyo en el detalle, y el de la navegación
          sigue a la vista. */}
      <Carrusel etiqueta="Tratamientos">
        {TRATAMIENTOS.map((t, i) => (
          <TarjetaTratamiento key={t.titulo} t={t} i={i} total={TRATAMIENTOS.length} />
        ))}
      </Carrusel>
    </section>
  );
}
