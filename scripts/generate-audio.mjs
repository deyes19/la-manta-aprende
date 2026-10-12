// Development-only GPL-3.0 eSpeak-NG tool; no synthesizer code is bundled in the app.
import create from "@echogarden/espeak-ng-emscripten";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
const engine = await create();
const voice = new engine.eSpeakNGWorker();
voice.set_voice("", "es", 0, 0, 0);
voice.set_rate(145);
const units = readdirSync("apps/web/src/content")
  .filter((name) => name.endsWith(".json"))
  .map((name) =>
    JSON.parse(readFileSync(`apps/web/src/content/${name}`, "utf8")),
  )
  .filter((data) => Array.isArray(data.steps));
const previous = existsSync("apps/web/public/audio/transcripts.json")
  ? JSON.parse(readFileSync("apps/web/public/audio/transcripts.json", "utf8"))
  : {};
const narrations = {};
for (const s of units.flatMap((unit) => unit.steps)) {
  narrations[s.id] = [
    s.title,
    s.instruction,
    s.dictation ?? "",
    ...(s.freePlay
      ? [
          "Toca un dibujo para añadirlo. Toca una figura de tu composición para seleccionarla; después toca una casilla vacía para moverla.",
        ]
      : []),
    ...s.text,
    s.activity?.prompt ?? "",
    ...(s.activity?.choices ?? []),
  ].join(". ");
  narrations[s.id + "-hint"] = s.hint;
  if (s.activity) {
    narrations[s.id + "-success"] =
      "¡Lo lograste! " + s.activity.explanation + " Pulsa Continuar.";
    narrations[s.id + "-retry"] =
      "Todavía no. " +
      s.hint +
      " Puedes corregir tu respuesta y volver a comprobar.";
  }
}
Object.assign(narrations, {
  inicio:
    "Bienvenido a La Manta Aprende. Elige tu nombre o escribe un alias. Elige tu grado y pulsa Crear perfil. Después elige período cuatro, una asignatura y Abrir unidad. Puedes escuchar cada pantalla con el botón del altavoz.",
  ruta: "Estás en tu ruta. Selecciona período cuatro y la asignatura que quieres aprender. Elige una unidad disponible. Pulsa Abrir unidad o Reanudar.",
  autoevaluacion:
    "¿Cómo te sentiste? Elige: lo hice con confianza, necesité una pista, o quiero practicar de nuevo. Después pulsa Guardar y terminar.",
  guardado:
    "Tu trabajo quedó guardado. Muestra al docente el trabajo que hiciste. Puedes volver a la ruta con el botón de la casa.",
});
mkdirSync("apps/web/public/audio", { recursive: true });
const tracked = new Set(
  spawnSync("git", ["ls-files", "apps/web/public/audio"], { encoding: "utf8" })
    .stdout.split("\n")
    .filter((p) => p.endsWith(".mp3"))
    .map((p) => p.split("/").pop().replace(".mp3", "")),
);
const seen = new Map();
const audioFiles = {};
for (const id of tracked) {
  if (previous[id] && existsSync(`apps/web/public/audio/${id}.mp3`))
    seen.set(previous[id], id);
}
for (const [id, raw] of Object.entries(narrations)) {
  const canonical = seen.get(raw) ?? id;
  seen.set(raw, canonical);
  audioFiles[id] = canonical;
  if (canonical !== id) {
    if (
      process.argv.includes("--prune-duplicates") &&
      !tracked.has(id) &&
      existsSync(`apps/web/public/audio/${id}.mp3`)
    )
      unlinkSync(`apps/web/public/audio/${id}.mp3`);
    continue;
  }
  if (previous[id] === raw && existsSync(`apps/web/public/audio/${id}.mp3`))
    continue;
  const text = raw
    .replace(
      /(\d+),(\d+)/g,
      (_, whole, fraction) => `${whole} coma ${fraction.split("").join(" ")}`,
    )
    .replace(/(\d+)\/(\d+)/g, "$1 de $2 partes")
    .replaceAll("×", " por ")
    .replaceAll("+", " más ")
    .replaceAll("=", " igual a ")
    .replaceAll("2.º", "segundo")
    .replaceAll("PWA", "aplicación");
  const chunks = [];
  voice.synthesize(text, (samples) => {
    chunks.push(
      Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength),
    );
    return false;
  });
  const pcm = Buffer.concat(chunks);
  if (pcm.length < 100) throw new Error("Síntesis vacía: " + id);
  const result = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-y",
      "-f",
      "s16le",
      "-ar",
      String(voice.get_samplerate()),
      "-ac",
      "1",
      "-i",
      "pipe:0",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "48k",
      `apps/web/public/audio/${id}.mp3`,
    ],
    { input: pcm },
  );
  if (result.status !== 0) throw new Error(result.stderr.toString());
}
writeFileSync(
  "apps/web/public/audio/transcripts.json",
  JSON.stringify(narrations, null, 2),
);
writeFileSync(
  "apps/web/src/data/audio-files.json",
  JSON.stringify(audioFiles, null, 2) + "\n",
);
console.log(
  `${Object.keys(narrations).length} narraciones; ${new Set(Object.values(audioFiles)).size} archivos de audio distintos.`,
);
