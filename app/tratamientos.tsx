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
    foto: "/img/tratamiento-diseno.jpg",
    alt: "Primer plano de la sonrisa de un hombre con barba corta",
  },
  {
    titulo: "Carillas",
    texto:
      "Láminas finas de porcelana sobre la cara visible del diente. En la valoración le decimos si son una opción para usted.",
    datos: ["Lo revisa un especialista", "Empieza con la valoración gratuita"],
    foto: "/img/tratamiento-carillas.jpg",
    alt: "Primer plano de una sonrisa amplia con los dientes superiores parejos",
  },
  {
    titulo: "Blanqueamiento",
    texto:
      "Aclara el color de sus dientes sin cambiar su forma. Antes se hace una limpieza dental.",
    datos: ["Cita de 60 minutos", "Antes, una limpieza de 45 minutos"],
    // "-3": el "-2" ya lo usó otra foto y next/image cachea por URL.
    foto: "/img/tratamiento-blanqueamiento-3.jpg",
    alt: "Primer plano de la sonrisa suave de una mujer mayor de piel clara",
  },
  {
    titulo: "Ortodoncia invisible",
    texto:
      "Alineadores transparentes para ordenar los dientes sin brackets a la vista. La valoración de ortodoncia es gratuita.",
    datos: ["Valoración de ortodoncia gratuita", "Controles de 20 minutos"],
    // "-2": next/image cachea por URL, con el nombre anterior se seguiría sirviendo la foto vieja.
    foto: "/img/tratamiento-ortodoncia-2.jpg",
    alt: "Primer plano de la sonrisa de un hombre de piel oscura, de tres cuartos de perfil",
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
