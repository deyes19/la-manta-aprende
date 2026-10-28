// Exercise the exact assets extracted from the signed APK, starting offline.
// This verifies the web flow; installing on a real Android device is a separate check.
import { chromium } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
const root = resolve("apps/android/build/verified-assets");
const profile = mkdtempSync("/workspace/scratch/manta-android-");
const screenshots = resolve("../entregas/revision-android");
mkdirSync(screenshots, { recursive: true });
const pilot = JSON.parse(
  readFileSync("apps/web/src/content/pilot.json", "utf8"),
);
const denied = [];
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
};
async function open() {
  const context = await chromium.launchPersistentContext(profile, {
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
  });
  await context.addInitScript(() => {
    window.workerAttempts = 0;
    if (navigator.serviceWorker) {
      const original = navigator.serviceWorker.register.bind(
        navigator.serviceWorker,
      );
      navigator.serviceWorker.register = (...args) => {
        window.workerAttempts++;
        return original(...args);
      };
    }
    window.nativeReports = [];
    window.MantaAndroid = {
      saveReport: (name, body, mime) =>
        window.nativeReports.push({ name, body, mime }),
    };
  });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "https://appassets.androidplatform.net") {
      denied.push(url.origin);
      await route.abort();
      return;
    }
    const path = resolve(
      root,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (!path.startsWith(root + "/") || !existsSync(path)) {
      await route.fulfill({ status: 404, body: "not found" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: types[extname(path)] ?? "application/octet-stream",
      body: readFileSync(path),
    });
  });
  await context.setOffline(true);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (error) => {
    throw error;
  });
  await page.goto("https://appassets.androidplatform.net/");
  return { context, page };
}
const next = (page) =>
  page
    .getByRole("button", { name: /Continuar →|Ya terminé · Continuar/ })
    .click();
let { context, page } = await open();
await page
  .getByText(
    "Lecciones, imágenes y audios incluidos. Puedes aprender sin internet.",
    { exact: false },
  )
  .waitFor();
await page.getByLabel("Mi alias").fill("Prueba familiar");
await page.getByRole("button", { name: "Crear perfil" }).click();
await page
  .locator("article")
  .filter({
    has: page.getByRole("heading", { name: pilot.title, exact: true }),
  })
  .getByRole("button", { name: "Abrir unidad" })
  .click();
await page.getByRole("button", { name: "Escuchar instrucciones" }).click();
await page.waitForFunction(
  () => document.querySelector("audio").currentTime > 0,
);
await page.screenshot({
  path: resolve(screenshots, "01-bienvenida.png"),
  fullPage: true,
});
await next(page);
await page.getByLabel("Tu respuesta").fill("11");
await page.getByRole("button", { name: "Comprobar" }).click();
await page
  .getByText(/Todavía no/)
  .first()
  .waitFor();
await page.getByLabel("Tu respuesta").fill("12");
await page.getByRole("button", { name: "Comprobar" }).click();
await next(page);
await page
  .getByRole("heading", { name: "Escribe la fecha y el título", exact: true })
  .waitFor();
await context.close();
({ context, page } = await open());
await page.getByRole("button", { name: /Prueba familiar/ }).click();
await page.getByRole("button", { name: "Reanudar" }).click();
await page
  .getByRole("heading", { name: "Escribe la fecha y el título", exact: true })
  .waitFor();
for (const step of pilot.steps.slice(2)) {
  await page.getByRole("heading", { name: step.title, exact: true }).waitFor();
  if (step.id === "practica-2") break;
  if (step.activity) {
    await page
      .getByRole("radio", { name: String(step.activity.answer), exact: true })
      .check();
    await page.getByRole("button", { name: "Comprobar" }).click();
  }
  await next(page);
}
for (let group = 1; group <= 5; group++)
  for (let n = 0; n < 2; n++)
    await page
      .getByRole("button", { name: new RegExp("^Grupo " + group + ":") })
      .click();
await page.getByRole("button", { name: "Comprobar" }).click();
await page
  .getByText(/¡Lo lograste!/)
  .first()
  .waitFor();
await page.screenshot({
  path: resolve(screenshots, "02-tabla-interactiva.png"),
  fullPage: true,
});
await page.getByRole("button", { name: "Docente", exact: false }).click();
await page.getByRole("button", { name: "Exportar JSON" }).click();
const reports = await page.evaluate(() => window.nativeReports);
assert.equal(reports.length, 1);
const exported = JSON.parse(reports[0].body);
assert.equal(exported.progress[0].attempts.descubro.length, 2);
assert.equal(exported.progress[0].attempts.descubro[0].correct, false);
assert.equal(exported.progress[0].attempts.descubro[1].correct, true);
assert.deepEqual(denied, []);
assert.equal(await page.evaluate(() => window.workerAttempts), 0);
assert.equal(
  await page.evaluate(() =>
    navigator.serviceWorker.getRegistrations().then((r) => r.length),
  ),
  0,
);
await context.close();
console.log(
  "APK assets: first opening offline, MP3 playback, activities, close/reopen persistence and native report bridge passed. No external requests.",
);
