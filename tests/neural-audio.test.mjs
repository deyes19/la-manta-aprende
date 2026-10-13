import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ssml,
  endpoint,
  isMp3,
  synthesize,
  jobs,
  voice,
} from "../scripts/audio/neural.mjs";
test("usa voz colombiana femenina, velocidad moderada y escapa el texto", () => {
  const xml = ssml('Ana & Luis <audio src="remoto">');
  assert.ok(xml.includes(voice));
  assert.ok(xml.includes('xml:lang="es-CO"'));
  assert.ok(xml.includes('rate="-8%"'));
  assert.ok(xml.includes("&amp;"));
  assert.ok(!xml.includes("<audio"));
});
test("números y unidades tienen pronunciación explícita", () => {
  const xml = ssml("0,005 L; 3 × 4 = 12; 3/4; 5 cm³");
  assert.ok(xml.includes("0 coma 0 0 5 litros"));
  assert.ok(xml.includes("3 por 4 igual a 12"));
  assert.ok(xml.includes("3 de 4 partes"));
  assert.ok(xml.includes("centímetros cúbicos"));
});
test("solo construye destinos regionales de Azure válidos", () => {
  assert.equal(
    endpoint("eastus"),
    "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
  );
  assert.throws(() => endpoint("eastus.evil.example"));
  assert.throws(() => endpoint("https://example.com"));
});
test("planifica las locuciones únicas sin pedir credenciales ni red", () => {
  assert.equal(jobs().length, 826);
  assert.ok(jobs().every((job) => job.text.length));
});
test("rechaza respuestas de texto sin escribirlas como audio", async () => {
  await assert.rejects(
    synthesize("Hola", {
      key: "fixture",
      region: "eastus",
      fetcher: async () => ({
        ok: true,
        arrayBuffer: async () => Buffer.from("texto no es audio"),
      }),
    }),
    /MP3 válido/,
  );
});
test("una denegación conserva el error y no imprime claves", async () => {
  await assert.rejects(
    synthesize("Hola", {
      key: "secreto-de-prueba",
      region: "eastus",
      fetcher: async () => ({ ok: false, status: 401 }),
    }),
    (error) =>
      error.message.includes("401") &&
      !error.message.includes("secreto-de-prueba"),
  );
});
test("acepta un MP3 y usa el formato de salida local", async () => {
  const bytes = Buffer.alloc(200);
  bytes.write("ID3");
  let request;
  const result = await synthesize("Hola", {
    key: "fixture",
    region: "eastus",
    fetcher: async (url, options) => {
      request = { url, ...options };
      return { ok: true, arrayBuffer: async () => bytes };
    },
  });
  assert.ok(isMp3(result));
  assert.equal(
    request.headers["X-Microsoft-OutputFormat"],
    "audio-24khz-48kbitrate-mono-mp3",
  );
});
