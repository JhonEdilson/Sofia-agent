"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Lo que la visita ha provocado "por dentro". Lo alimentan el formulario y Sofía; lo lee la sección
// "Lo que acaba de pasar por dentro". Vive solo en el navegador de quien visita: no se guarda en ningún lado.

export interface CitaDemo {
  id: string;
  origen: "formulario" | "sofia";
  inicio?: string; // ISO con offset; puede faltar si Sofía no devolvió el detalle
  titulo?: string;
}

export interface AvisoDemo {
  id: string;
  hora: string; // "10:32 a. m.", cuando se registró en este navegador
}

interface Estado {
  cita: CitaDemo | null;
  aviso: AvisoDemo | null;
  registrarCita: (c: CitaDemo) => void;
  registrarAviso: (id: string) => void;
}

const Contexto = createContext<Estado | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [cita, setCita] = useState<CitaDemo | null>(null);
  const [aviso, setAviso] = useState<AvisoDemo | null>(null);

  // Misma cita (mismo id) = el segundo evento con más detalle: se fusiona, no se reemplaza.
  const registrarCita = useCallback((c: CitaDemo) => {
    setCita((prev) => {
      if (!prev || prev.id !== c.id) return c;
      return {
        ...prev,
        ...(c.inicio && { inicio: c.inicio }),
        ...(c.titulo && { titulo: c.titulo }),
      };
    });
  }, []);

  const registrarAviso = useCallback((id: string) => {
    setAviso((prev) => {
      if (prev?.id === id) return prev;
      const hora = new Date().toLocaleTimeString("es-CO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
      });
      return { id, hora };
    });
  }, []);

  const valor = useMemo(
    () => ({ cita, aviso, registrarCita, registrarAviso }),
    [cita, aviso, registrarCita, registrarAviso],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDemo(): Estado {
  const c = useContext(Contexto);
  if (!c) throw new Error("useDemo debe usarse dentro de <DemoProvider>");
  return c;
}
