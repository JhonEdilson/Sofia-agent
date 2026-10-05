// Corre con: node --test lib/slots.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { aISO, fechasVisibles, filtrarLibres, finSlot, slotsDelDia, slotValido } from "./slots.ts";

// Lunes 2026-10-05, 10:00 en Bogotá.
const AHORA = Date.parse("2026-10-05T10:00:00-05:00");

test("lunes a viernes: 22 franjas de 7:00 a 17:30", () => {
  const s = slotsDelDia("2026-10-06"); // martes
  assert.equal(s.length, 22);
  assert.equal(s[0], "2026-10-06T07:00:00-05:00");
  assert.equal(s.at(-1), "2026-10-06T17:30:00-05:00");
});

test("sábado: 10 franjas de 8:00 a 12:30", () => {
  const s = slotsDelDia("2026-10-10");
  assert.equal(s.length, 10);
  assert.equal(s.at(-1), "2026-10-10T12:30:00-05:00");
});

test("domingo, festivo y fechas imposibles: sin franjas", () => {
  assert.deepEqual(slotsDelDia("2026-10-11"), []); // domingo
  assert.deepEqual(slotsDelDia("2026-10-12"), []); // festivo
  assert.deepEqual(slotsDelDia("2026-02-31"), []); // no existe
  assert.deepEqual(slotsDelDia("mañana"), []);
});

test("filtrarLibres quita pasadas, anticipación mínima y cruces", () => {
  const dia = slotsDelDia("2026-10-05");
  const libres = filtrarLibres(
    dia,
    [{ start: "2026-10-05T14:00:00-05:00", end: "2026-10-05T15:00:00-05:00" }],
    AHORA,
  );
  assert.ok(!libres.includes("2026-10-05T09:00:00-05:00")); // ya pasó
  assert.ok(!libres.includes("2026-10-05T11:30:00-05:00")); // menos de 2 h de anticipación
  assert.ok(libres.includes("2026-10-05T12:00:00-05:00")); // justo 2 h: entra
  assert.ok(!libres.includes("2026-10-05T14:00:00-05:00")); // ocupado
  assert.ok(!libres.includes("2026-10-05T14:30:00-05:00")); // ocupado
  assert.ok(libres.includes("2026-10-05T13:30:00-05:00")); // termina justo cuando empieza lo ocupado
  assert.ok(libres.includes("2026-10-05T15:00:00-05:00")); // empieza justo cuando termina
});

test("slotValido solo acepta franjas exactas y dentro de la ventana", () => {
  assert.equal(slotValido("2026-10-06T07:00:00-05:00", AHORA), true);
  assert.equal(slotValido("2026-10-06T07:15:00-05:00", AHORA), false); // fuera de la grilla
  assert.equal(slotValido("2026-10-06T07:00:00Z", AHORA), false); // otro formato, mismo instante no sirve
  assert.equal(slotValido("2026-10-05T10:30:00-05:00", AHORA), false); // anticipación
  assert.equal(slotValido("2026-10-20T07:00:00-05:00", AHORA), false); // fuera de 14 días
  assert.equal(slotValido("2026-10-11T08:00:00-05:00", AHORA), false); // domingo
  assert.equal(slotValido("basura", AHORA), false);
});

test("fechasVisibles: 14 días desde hoy en Bogotá, incluso pasada la medianoche UTC", () => {
  const tarde = Date.parse("2026-10-05T21:00:00-05:00"); // ya es 06 en UTC
  const f = fechasVisibles(tarde);
  assert.equal(f.length, 14);
  assert.equal(f[0], "2026-10-05");
  assert.equal(f[13], "2026-10-18");
});

test("finSlot suma 30 min y aISO conserva el offset", () => {
  assert.equal(finSlot("2026-10-06T07:30:00-05:00"), "2026-10-06T08:00:00-05:00");
  assert.equal(aISO(Date.parse("2026-10-06T00:00:00Z")), "2026-10-05T19:00:00-05:00");
});
