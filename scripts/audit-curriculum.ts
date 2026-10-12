import { readFileSync, existsSync } from "node:fs";
import { unitSchema } from "../packages/content-schema/index";
const u = unitSchema.parse(
  JSON.parse(readFileSync("apps/web/src/content/pilot.json", "utf8")),
);
console.log(
  `${u.id}: ${u.source.status}; fuente disponible: ${u.source.file}; localizador: ${u.source.locator}`,
);
if (existsSync("docs/fuentes/manifest.json"))
  console.log(readFileSync("docs/fuentes/manifest.json", "utf8"));
else console.log("No se han importado mallas ni planeaciones originales.");
console.log(
  "Solo un piloto didáctico. No hay catálogo institucional validado; no se contabilizan temas como OVA.",
);
