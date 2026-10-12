// Development-only GPL-3.0 eSpeak-NG tool; no synthesizer code is bundled in the app.
import create from "@echogarden/espeak-ng-emscripten";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
const engine = await create();
const voice = new engine.eSpeakNGWorker();
voice.set_voice("", "es", 0, 0, 0);
voice.set_rate(145);
const unit = JSON.parse(
  readFileSync("apps/web/src/content/pilot.json", "utf8"),
);
const narrations = {};
for (const s of unit.steps) {
  narrations[s.id] = [
    s.title,
    s.instruction,
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
    "Bienvenido a La Manta Aprende. Elige tu nombre o escribe un alias. Elige tu grado y pulsa Crear perfil. Si estás en segundo, elige período cuatro, Matemáticas y Abrir unidad. Puedes escuchar cada pantalla con el botón del altavoz.",
  ruta: "Estás en tu ruta. Selecciona período cuatro y Matemáticas. Abre La multiplicación en nuestra huerta. Pulsa Empezar o Reanudar.",
  autoevaluacion:
    "¿Cómo te sentiste? Elige: lo hice con confianza, necesité una pista, o quiero practicar de nuevo. Después pulsa Guardar y terminar.",
  guardado:
    "Tu trabajo quedó guardado. Muestra tu cuaderno al docente. Puedes volver a la ruta con el botón de la casa.",
});
mkdirSync("apps/web/public/audio", { recursive: true });
for (const [id, raw] of Object.entries(narrations)) {
  const text = raw
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
console.log(Object.keys(narrations).length + " audios españoles generados");
