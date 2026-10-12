import { units } from "../apps/web/src/data/content";
import { existsSync, readFileSync } from "node:fs";
for (const u of units)
  console.log(
    `${u.id}: ${u.source.status}; ${u.source.file}; ${u.source.locator}`,
  );
if (existsSync("docs/fuentes/manifest.json"))
  console.log(readFileSync("docs/fuentes/manifest.json", "utf8"));
else console.log("No se han importado originales.");
console.log(
  "Alcance solicitado: transición a quinto, cuarto período, Matemáticas, Lengua Castellana y Ciencias Sociales. Solo las unidades ejecutables se cuentan como OVA.",
);
