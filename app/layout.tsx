import type { Metadata } from "next";
import { Gloock, Manrope } from "next/font/google";
import "./globals.css";

// Gloock solo existe en peso 400; Manrope es variable, no hace falta declarar pesos.
const gloock = Gloock({
  variable: "--font-gloock",
  subsets: ["latin"],
  weight: "400",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clínica Odontológica Sonrisa Viva | Demo de portafolio",
  description:
    "Demo de portafolio de Jhon Escobar: clínica ficticia con agenda en línea y una asistente virtual que atiende y agenda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${gloock.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
