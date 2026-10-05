// Corre con: node --test lib/eventos-sofia.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretarEvento } from "./eventos-sofia.ts";

const evento = (extra: object) => ({ tool_name: "google_calendar_create_event", tool_call_id: "t1", ...extra });

test("create_event con payload: saca hora y título del evento de Google", () => {
  const full = JSON.stringify({ summary: "Valoración inicial: Ana", start: { dateTime: "2026-10-06T07:00:00-05:00" } });
  assert.deepEqual(interpretarEvento(evento({ full_tool_result: full })), {
    tipo: "cita",
    id: "t1",
    inicio: "2026-10-06T07:00:00-05:00",
    titulo: "Valoración inicial: Ana",
  });
});

test("create_event sin payload (primer evento): cita sin detalles, mismo id para fusionar", () => {
  assert.deepEqual(interpretarEvento(evento({})), { tipo: "cita", id: "t1", inicio: undefined, titulo: undefined });
});

test("create_event con payload que no es JSON o con otra forma: no rompe, sin detalles", () => {
  assert.equal((interpretarEvento(evento({ full_tool_result: "no es json" })) as { inicio?: string }).inicio, undefined);
  assert.equal((interpretarEvento(evento({ full_tool_result: '{"start":"texto"}' })) as { inicio?: string }).inicio, undefined);
});

test("create_event con error: no se muestra como cita creada", () => {
  assert.equal(interpretarEvento(evento({ is_error: true })), null);
  assert.equal(interpretarEvento(evento({ full_tool_result: '{"error":"forbidden"}' })), null);
});

test("avisar_humano: aviso; con error, nada", () => {
  assert.deepEqual(interpretarEvento({ tool_name: "avisar_humano", tool_call_id: "t2" }), { tipo: "aviso", id: "t2" });
  assert.equal(interpretarEvento({ tool_name: "avisar_humano", tool_call_id: "t2", is_error: true }), null);
});

test("otras tools (disponibilidad, listar, colgar): se ignoran", () => {
  for (const tool_name of ["google_calendar_check_availability", "google_calendar_list_events", "end_call"]) {
    assert.equal(interpretarEvento({ tool_name, tool_call_id: "x" }), null);
  }
});
