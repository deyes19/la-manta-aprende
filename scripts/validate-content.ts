import { units } from "../apps/web/src/data/content";
import { existsSync, readFileSync } from "node:fs";
const ids = new Set<string>();
const transcripts = JSON.parse(
  readFileSync("apps/web/public/audio/transcripts.json", "utf8"),
);
for (const unit of units) {
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
      if (!existsSync(`apps/web/public/audio/${id}.mp3`) || !transcripts[id])
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
