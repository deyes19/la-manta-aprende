import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { jobs, isMp3, voice } from "./neural.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const staged = resolve(root, "../entregas/audio-neural-preparado");
const manifest = JSON.parse(
  readFileSync(resolve(staged, "manifest.json"), "utf8"),
);
const expected = jobs();
const files = new Map(manifest.files.map((f) => [f.id, f.file]));
if (!["azure", "edge"].includes(manifest.provider ?? "azure"))
  throw new Error("Proveedor de voz no reconocido.");
if (manifest.voice !== voice)
  throw new Error("El lote no corresponde a la voz seleccionada.");
// Validate the complete batch before replacing any classroom resources.
for (const job of expected) {
  const path = files.get(job.id);
  if (
    path !== resolve(staged, job.id + ".mp3") ||
    !existsSync(path) ||
    !isMp3(readFileSync(path))
  )
    throw new Error("Audio faltante o inválido: " + job.id);
  const metadata = JSON.parse(
    readFileSync(resolve(staged, job.id + ".json"), "utf8"),
  );
  if (metadata.text !== job.text || metadata.voice !== voice)
    throw new Error("El guion cambió: " + job.id);
}
const backup = resolve(
  root,
  "../entregas",
  "audio-anterior-" + new Date().toISOString().replaceAll(":", "-"),
);
mkdirSync(backup, { recursive: true });
for (const job of expected)
  copyFileSync(
    resolve(root, "apps/web/public/audio", job.id + ".mp3"),
    resolve(backup, job.id + ".mp3"),
  );
for (const job of expected)
  copyFileSync(
    files.get(job.id),
    resolve(root, "apps/web/public/audio", job.id + ".mp3"),
  );
writeFileSync(
  resolve(root, "apps/web/src/data/audio-provider.json"),
  JSON.stringify(
    {
      provider: manifest.provider ?? "azure",
      voice,
      locale: "es-CO",
      rate: "-8%",
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Audios sustituidos. Respaldo: " +
    backup +
    ". Ejecuta validación, compilación y pruebas offline antes de publicar.",
);
