import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, extname } from "node:path";
import { createHash } from "node:crypto";
const [input, kind, locator] = process.argv.slice(2);
if (!input || !["malla", "planeacion"].includes(kind) || !locator) {
  console.error(
    'Uso: node scripts/import-source.mjs archivo malla|planeacion "página/tabla/encabezado"',
  );
  process.exit(1);
}
if (
  ![".docx", ".pdf", ".json", ".csv", ".md"].includes(
    extname(input).toLowerCase(),
  )
)
  throw new Error("Formato no admitido");
const data = readFileSync(input);
const sha256 = createHash("sha256").update(data).digest("hex");
const name = basename(input);
const path = `docs/fuentes/${name}`;
mkdirSync("docs/fuentes", { recursive: true });
const manifestPath = "docs/fuentes/manifest.json";
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : [];
if (
  existsSync(path) &&
  createHash("sha256").update(readFileSync(path)).digest("hex") !== sha256
)
  throw new Error(
    "Existe un archivo diferente con ese nombre. Conserva ambas versiones con nombres distintos.",
  );
if (!existsSync(path)) writeFileSync(path, data, { flag: "wx" });
if (!manifest.some((r) => r.sha256 === sha256)) {
  manifest.push({
    file: path,
    kind,
    locator,
    sha256,
    importedAt: new Date().toISOString(),
    status: "PENDIENTE_VALIDACION",
  });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
console.log(
  "Fuente conservada; requiere lectura y revisión docente. No se validó ni modificó el currículo del piloto.",
);
