import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import pilot from "../../src/content/pilot.json" with { type: "json" };
import fractions from "../../src/content/g3-matematicas-p4-fracciones.json" with { type: "json" };
async function enter(page: Page, grade: number, title: string) {
  await page.goto("/");
  await page.getByLabel("Mi alias").fill("Brote");
  await page.getByLabel("Mi grado").selectOption(String(grade));
  await page.getByRole("button", { name: "Crear perfil" }).click();
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .getByRole("button", { name: "Abrir unidad" })
    .click();
}
const next = (page: Page) =>
  page
    .getByRole("button", { name: /Continuar →|Ya terminé · Continuar/ })
    .click();
test("termina la tabla del 2 antes de escribir la tabla del 3 y comprueba grupos dibujados", async ({
  page,
}) => {
  await enter(page, 2, pilot.title);
  for (const s of pilot.steps) {
    await expect(
      page.getByRole("heading", { name: s.title, exact: true }),
    ).toBeVisible();
    if (s.id === "practica-2") break;
    if (s.activity) {
      if (s.activity.kind === "choice")
        await page
          .getByRole("radio", { name: String(s.activity.answer), exact: true })
          .check();
      else
        await page.getByLabel("Tu respuesta").fill(String(s.activity.answer));
      await page.getByRole("button", { name: "Comprobar" }).click();
    }
    await next(page);
  }
  await expect(
    page.getByRole("heading", { name: "Escribe la tabla del 3", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Tu respuesta")).toHaveCount(0);
  for (let g = 1; g <= 5; g++)
    for (let n = 0; n < (g === 5 ? 1 : 2); n++)
      await page
        .getByRole("button", { name: new RegExp(`^Grupo ${g}:`) })
        .click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/Todavía no/).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Terminé este tema/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /^Grupo 5:/ }).click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/¡Lo lograste!/).first()).toBeVisible();
  await page.screenshot({
    path: "test-results/tabla-2-interactiva.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Terminé este tema/ }).click();
  await expect(
    page.getByRole("heading", { name: "La tabla del 3", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".topic-banner")).toContainText("Tema 3 de 5");
});
test("colorea fracciones, corrige y reparte sin depender de una caja de texto", async ({
  page,
  context,
}) => {
  await enter(page, 3, fractions.title);
  for (const s of fractions.steps) {
    if (s.phase === "Practico") break;
    await next(page);
  }
  await page.getByRole("button", { name: "Parte 1", exact: true }).click();
  await page.getByRole("button", { name: "Parte 2", exact: true }).click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/Todavía no/).first()).toBeVisible();
  await page.getByRole("button", { name: "Parte 3", exact: true }).click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/¡Lo lograste!/).first()).toBeVisible();
  await next(page);
  const firstPractice = fractions.steps.findIndex(
    (s) => s.phase === "Practico",
  );
  const targetPractice = fractions.steps.findIndex(
    (s) => s.title === "Practica: Mitad, tercera y cuarta parte",
  );
  for (const step of fractions.steps.slice(firstPractice + 1, targetPractice)) {
    await expect(
      page.getByRole("heading", { name: step.title, exact: true }),
    ).toBeVisible();
    await next(page);
  }
  await expect(
    page.getByRole("heading", {
      name: "Practica: Mitad, tercera y cuarta parte",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Tu respuesta")).toHaveCount(0);
  for (let g = 1; g <= 4; g++)
    for (let n = 0; n < (g === 1 ? 2 : g === 2 ? 4 : 3); n++)
      await page
        .getByRole("button", { name: new RegExp(`^Grupo ${g}:`) })
        .click();
  await expect(
    page.getByText("Has colocado 12 objetos en 4 grupos."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/Todavía no/).first()).toBeVisible();
  await page
    .getByRole("button", { name: "Quitar un objeto del grupo 2", exact: true })
    .click();
  await page.getByRole("button", { name: /^Grupo 1:/ }).click();
  const report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect
    .poll(() => page.locator(".offline-status").textContent(), {
      timeout: 120000,
    })
    .toContain("preparados");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/¡Lo lograste!/).first()).toBeVisible();
  await page.screenshot({
    path: "test-results/fracciones-reparto.png",
    fullPage: true,
  });
});
test("reanuda un avance de versión 1 conservando intentos y devoluciones docentes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Mi alias").fill("Memoria");
  await page.getByRole("button", { name: "Crear perfil" }).click();
  const original = {
    unitId: pilot.id,
    version: 1,
    index: 21,
    completed: pilot.migrations[0].stepOrder.slice(0, 21),
    attempts: {
      "evaluacion-problema": [
        { value: 19, correct: false, at: "antes", hints: 1 },
      ],
    },
    hints: { "evaluacion-problema": 1 },
    teacherReview: { note: "Observación anterior", at: "antes" },
    finished: false,
    updatedAt: "antes",
  };
  await page.evaluate(async (record) => {
    const request = indexedDB.open("manta-aprende", 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const profiles = db
      .transaction("profiles")
      .objectStore("profiles")
      .getAll();
    const rows = await new Promise<any[]>((resolve, reject) => {
      profiles.onsuccess = () => resolve(profiles.result);
      profiles.onerror = () => reject(profiles.error);
    });
    const tx = db.transaction("progress", "readwrite");
    tx.objectStore("progress").put({ ...record, profileId: rows[0].id });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, original);
  await page.reload();
  await page.getByRole("button", { name: /Memoria/ }).click();
  await page.getByRole("button", { name: "Reanudar" }).click();
  await expect(
    page.getByRole("heading", { name: "Elige la suma", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Docente", exact: false }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  const stream = await (await download).createReadStream();
  const chunks = [];
  for await (const c of stream!) chunks.push(c);
  const result = JSON.parse(Buffer.concat(chunks).toString()).progress.find(
    (r: any) => r.unitId === pilot.id,
  );
  expect(result.version).toBe(2);
  expect(result.attempts).toEqual(original.attempts);
  expect(result.teacherReview).toEqual(original.teacherReview);
});
