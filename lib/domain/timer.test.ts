import { test } from "node:test";
import assert from "node:assert/strict";
import { elapsedFrom, formatDuration, formatDurationShort } from "./timer.ts";

test("elapsedFrom calcula segundos desde started_at", () => {
  const start = new Date("2026-08-24T10:00:00Z");
  assert.equal(elapsedFrom(start, new Date("2026-08-24T13:12:00Z")), 3 * 3600 + 12 * 60);
});

test("elapsedFrom nunca devolve negativo (relogio do cliente adiantado)", () => {
  const start = new Date("2026-08-24T10:00:00Z");
  assert.equal(elapsedFrom(start, new Date("2026-08-24T09:59:00Z")), 0);
});

test("elapsedFrom aceita string ISO do Postgres", () => {
  assert.equal(elapsedFrom("2026-08-24T10:00:00.000Z", new Date("2026-08-24T10:00:30Z")), 30);
});

test("formatDuration usa HH:MM:SS", () => {
  assert.equal(formatDuration(3 * 3600 + 12 * 60), "03:12:00");
  assert.equal(formatDuration(0), "00:00:00");
  assert.equal(formatDuration(59), "00:00:59");
  assert.equal(formatDuration(null), "--:--:--");
});

test("formatDurationShort e legivel em listas", () => {
  assert.equal(formatDurationShort(45), "45s");
  assert.equal(formatDurationShort(12 * 60), "12min");
  assert.equal(formatDurationShort(3 * 3600 + 12 * 60), "3h 12min");
  assert.equal(formatDurationShort(null), "—");
});
