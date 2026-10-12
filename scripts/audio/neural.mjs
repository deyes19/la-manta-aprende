import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const voice = "es-CO-SalomeNeural";
export const sampleText =
  "¡Hola! Vamos a aprender juntos en La Manta. Busca tu cuaderno y un lápiz. Observa tres canastas con cuatro mangos en cada una. Puedes contar despacio. Cuando estés listo, toca Continuar. Si necesitas ayuda, escucha otra vez. ¡Tú puedes hacerlo a tu ritmo!";
export function normalizeText(text) {
  return text
    .replace(
      /(\d+),(\d+)/g,
      (_, whole, fraction) => `${whole} coma ${fraction.split("").join(" ")}`,
    )
    .replace(/(\d+)\/(\d+)/g, "$1 de $2 partes")
    .replaceAll("×", " por ")
    .replaceAll("÷", " dividido entre ")
    .replaceAll("−", " menos ")
    .replaceAll("+", " más ")
    .replaceAll("=", " igual a ")
    .replaceAll("cm²", "centímetros cuadrados")
    .replaceAll("cm³", "centímetros cúbicos")
    .replace(/\bkg\b/g, "kilogramos")
    .replace(/\bcm\b/g, "centímetros")
    .replace(/\bL\b/g, "litros")
    .replace(/\s+/g, " ")
    .trim();
}
export function ssml(text) {
  const escaped = normalizeText(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-CO"><voice name="${voice}"><prosody rate="-8%">${escaped}</prosody></voice></speak>`;
}
export function endpoint(region) {
  if (!/^[a-z0-9]+$/.test(region))
    throw new Error(
      "Región de Azure no válida. Usa el identificador, por ejemplo eastus.",
    );
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
}
export function isMp3(buffer) {
  return (
    buffer.length > 128 &&
    (buffer.subarray(0, 3).toString() === "ID3" ||
      (buffer[0] === 255 && (buffer[1] & 224) === 224))
  );
}
export async function synthesize(text, { region, key, fetcher = fetch }) {
  const response = await fetcher(endpoint(region), {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "LaMantaAprende",
    },
    body: ssml(text),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok)
    throw new Error(
      `Servicio de voz respondió HTTP ${response.status}. Verifica región, binding y cuota; no se sustituyó audio.`,
    );
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!isMp3(bytes))
    throw new Error("El servicio no devolvió MP3 válido. No se guardó.");
  return bytes;
}
export function jobs() {
  const texts = JSON.parse(
    readFileSync(
      resolve(root, "apps/web/public/audio/transcripts.json"),
      "utf8",
    ),
  );
  const map = JSON.parse(
    readFileSync(resolve(root, "apps/web/src/data/audio-files.json"), "utf8"),
  );
  const unique = new Map();
  for (const [id, canonical] of Object.entries(map)) {
    if (!texts[id]) throw new Error("Falta transcripción: " + id);
    if (unique.has(canonical) && unique.get(canonical) !== texts[id])
      throw new Error("Alias de audio con textos distintos: " + canonical);
    unique.set(canonical, texts[id]);
  }
  return [...unique].map(([id, text]) => ({ id, text }));
}
export async function run(args = process.argv.slice(2)) {
  const all = args.includes("--all");
  const list = all
    ? jobs()
    : [{ id: "muestra-salome-colombiana", text: sampleText }];
  if (args.includes("--plan")) {
    console.log(
      JSON.stringify(
        {
          voice,
          locale: "es-CO",
          rate: "-8%",
          clips: list.length,
          characters: list.reduce(
            (sum, job) => sum + normalizeText(job.text).length,
            0,
          ),
          needs: ["MANTA_SPEECH_REGION", "MANTA_SPEECH_KEY"],
          mode: all ? "batch" : "sample",
        },
        null,
        2,
      ),
    );
    return;
  }
  const key = process.env.MANTA_SPEECH_KEY;
  const region = process.env.MANTA_SPEECH_REGION;
  if (!key || !region)
    throw new Error(
      "Falta configurar MANTA_SPEECH_KEY y MANTA_SPEECH_REGION en el entorno. No compartas la clave en chat. Los audios actuales siguen disponibles.",
    );
  endpoint(region);
  const dir = resolve(
    root,
    "../entregas",
    all ? "audio-neural-preparado" : "voz-muestras",
  );
  mkdirSync(dir, { recursive: true });
  const completed = [];
  for (const [index, job] of list.entries()) {
    const file = resolve(dir, job.id + ".mp3");
    const metadata = resolve(dir, job.id + ".json");
    const config = { voice, region, rate: "-8%", text: job.text };
    if (!(
      existsSync(file) &&
      existsSync(metadata) &&
      JSON.stringify(JSON.parse(readFileSync(metadata, "utf8"))) ===
        JSON.stringify(config)
    )) {
      const bytes = await synthesize(job.text, { region, key });
      writeFileSync(file, bytes);
      writeFileSync(metadata, JSON.stringify(config, null, 2) + "\n");
    }
    completed.push({ id: job.id, file });
    console.log(`Preparado ${index + 1}/${list.length}: ${job.id}`);
  }
  writeFileSync(
    resolve(dir, "manifest.json"),
    JSON.stringify({ voice, rate: "-8%", files: completed }, null, 2) + "\n",
  );
  console.log(
    all
      ? "Lote preparado fuera del repositorio. Valida su calidad y aplícalo con npm run audio:apply:neural."
      : "Muestra lista: " + completed[0].file,
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
