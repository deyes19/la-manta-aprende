import { unitSchema } from "../packages/content-schema/index";
import { readFileSync, existsSync } from "node:fs";
const unit = unitSchema.parse(
  JSON.parse(readFileSync("apps/web/src/content/pilot.json", "utf8")),
);
for (const s of unit.steps)
  for (const suffix of [
    "",
    "-hint",
    ...(s.activity ? ["-success", "-retry"] : []),
  ])
    if (!existsSync(`apps/web/public/audio/${s.id}${suffix}.mp3`))
      throw new Error(`Audio faltante: ${s.id}${suffix}`);
console.log(
  `${unit.steps.length} pantallas válidas; audios locales presentes. Estado curricular: ${unit.source.status}`,
);
