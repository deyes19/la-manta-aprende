import { audioFile } from "../apps/web/src/data/audio";
import { createHash } from "node:crypto";
import { units } from "../apps/web/src/data/content";
import { existsSync, readFileSync } from "node:fs";
const ids = new Set<string>();
const transcripts = JSON.parse(
  readFileSync("apps/web/public/audio/transcripts.json", "utf8"),
);
for (const unit of units) {
  if (
    unit.source.status !== "PENDIENTE_FUENTE" &&
    !existsSync(unit.source.file)
  )
    throw new Error(`Fuente original ausente: ${unit.source.file}`);
  for (const s of unit.steps) {
    if (ids.has(s.id))
      throw new Error(`ID de pantalla compartido entre unidades: ${s.id}`);
    ids.add(s.id);
    for (const suffix of [
      "",
      "-hint",
      ...(s.activity ? ["-success", "-retry"] : []),
    ]) {
      const id = s.id + suffix;
      if (!existsSync(`apps/web/public${audioFile(id)}`) || !transcripts[id])
        throw new Error(`Audio/transcripción faltante: ${id}`);
    }
  }
  console.log(
    `${unit.id}: ${unit.steps.length} pantallas válidas, audios presentes; ${unit.source.status}`,
  );
}
console.log(
  `${units.length} unidades ejecutables. La cobertura pendiente no se contabiliza como OVA.`,
);

for (const entry of JSON.parse(
  readFileSync("docs/fuentes/manifest.json", "utf8"),
)) {
  if (
    createHash("sha256").update(readFileSync(entry.file)).digest("hex") !==
    entry.sha256
  )
    throw new Error("Cambió la fuente original: " + entry.file);
}
console.log("Huellas SHA-256 de las 11 fuentes originales verificadas.");
