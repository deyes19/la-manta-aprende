import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(
  fileURLToPath(new URL("../apps/web/dist/", import.meta.url)),
);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
};
try {
  await stat(resolve(root, "index.html"));
} catch {
  console.error(
    "Falta la compilación. Ejecuta npm run build o usa el paquete piloto preparado.",
  );
  process.exit(1);
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const path = resolve(
      root,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (!path.startsWith(root + sep) && path !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    const actual = path === root ? resolve(root, "index.html") : path;
    const data = await readFile(actual);
    res.writeHead(200, {
      "Content-Type": types[extname(actual)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Archivo no encontrado");
  }
});
server.on("error", (e) => {
  console.error("No se pudo abrir el puerto 4173:", e.message);
  process.exit(1);
});
server.listen(4173, "127.0.0.1", () =>
  console.log(
    "La Manta Aprende: abre http://localhost:4173. Mantén esta ventana abierta.",
  ),
);
