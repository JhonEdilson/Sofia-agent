// Horario, dirección y teléfono de knowledge-base.md. La dirección y el teléfono son inventados y se
// rotulan como tales: nada que un visitante pueda tomar por una clínica real.
const HORARIO = [
  ["Lunes a viernes", "7:00 a. m. a 6:00 p. m."],
  ["Sábado", "8:00 a. m. a 1:00 p. m."],
  ["Domingos y festivos", "Cerrado"],
] as const;

export function Horario() {
  return (
    <section id="horario" className="px-5 md:px-10">
      <div className="grid gap-10 border-t border-line py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <div data-aparecer="subir">
          <h2 className="font-display text-titulo">Cuándo y dónde</h2>

          <dl className="mt-8 max-w-md text-cuerpo">
            {HORARIO.map(([dia, horas]) => (
              <div key={dia} className="flex items-baseline justify-between gap-4 border-b border-line py-4 first:border-t">
                <dt className="font-medium">{dia}</dt>
                <dd className="text-muted">{horas}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-md text-nota text-muted">En línea se agenda con al menos 2 horas de anticipación.</p>
        </div>

        <div data-aparecer="fundir" className="self-start rounded-[20px] bg-white p-6 md:p-8">
          <span className="inline-block rounded-full border border-line px-3 py-1 text-nota font-semibold">
            Dirección ficticia
          </span>
          <address className="mt-5 text-dato font-medium not-italic tracking-[-.01em]">
            Carrera 48 # 10-45, consultorio 302
            <br />
            El Poblado, Medellín
          </address>
          <p className="mt-3 text-cuerpo text-muted">Teléfono (604) 000 0000</p>
          <p className="mt-5 text-cuerpo text-muted">
            El edificio tiene parqueadero para visitantes, sujeto a disponibilidad.
          </p>
          <p className="mt-5 border-t border-line pt-5 text-nota text-muted">
            La clínica es ficticia: esta dirección y este teléfono no existen.
          </p>
        </div>
      </div>
    </section>
  );
}
