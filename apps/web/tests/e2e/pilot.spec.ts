import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import unit from "../../src/content/pilot.json" with { type: "json" };
async function create(page: Page) {
  await page.goto("/");
  await page.getByLabel("Mi alias").fill("Semilla");
  await page.getByRole("button", { name: "Crear perfil" }).click();
  await page.getByRole("button", { name: "Abrir unidad" }).click();
}
async function next(page: Page) {
  await page
    .getByRole("button", { name: /Continuar →|Ya terminé · Continuar/ })
    .click();
}
test("recorrido completo, intentos, reanudación, reportes y uso sin internet", async ({
  page,
  context,
}) => {
  const remote: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://localhost:4173") &&
      !r.url().startsWith("blob:")
    )
      remote.push(r.url());
  });
  await create(page);
  await expect(
    page.getByRole("heading", { name: unit.steps[0].title }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Escuchar instrucciones" }).click();
  await expect
    .poll(() =>
      page
        .locator("audio")
        .first()
        .evaluate((a: HTMLAudioElement) => a.duration),
    )
    .toBeGreaterThan(1);
  await expect
    .poll(() =>
      page
        .locator("audio")
        .first()
        .evaluate((a: HTMLAudioElement) => a.currentTime),
    )
    .toBeGreaterThan(0);
  await page.screenshot({
    path: "test-results/bienvenida.png",
    fullPage: true,
  });
  await next(page);
  await page.getByLabel("Tu respuesta").fill("11");
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/Todavía no/).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar →" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Necesito una pista" }).click();
  await page.getByLabel("Tu respuesta").fill("12");
  await page.getByRole("button", { name: "Comprobar" }).click();
  await next(page);
  for (let i = 2; i < unit.steps.length; i++) {
    const s = unit.steps[i];
    await expect(page.locator(".groups")).toHaveCount(s.groups ? 1 : 0);
    await expect(
      page.getByRole("heading", { name: s.title, exact: true }),
    ).toBeVisible();
    if (i === 8) {
      await expect(page.getByText(/^Fecha:/)).toBeVisible();
      await page.reload();
      await page.getByRole("button", { name: /Semilla/ }).click();
      await page.getByRole("button", { name: "Reanudar" }).click();
      await expect(
        page.getByRole("heading", { name: s.title, exact: true }),
      ).toBeVisible();
    }
    if (s.activity) {
      const a = s.activity;
      if (a.kind === "groups") {
        for (let g = 0; g < s.groups![0]; g++)
          for (let n = 0; n < s.groups![1]; n++)
            await page
              .getByRole("button", { name: new RegExp(`^Grupo ${g + 1}:`) })
              .click();
      } else if (a.kind === "choice") {
        await page
          .getByRole("radio", { name: String(a.answer), exact: true })
          .check();
      } else {
        if (s.id === "evaluacion-problema") {
          await page.getByLabel("Tu respuesta").fill("19");
          await page.getByRole("button", { name: "Comprobar" }).click();
          await page
            .getByRole("button", { name: "Necesito una pista" })
            .click();
        }
        await page.getByLabel("Tu respuesta").fill(String(a.answer));
      }
      await page.getByRole("button", { name: "Comprobar" }).click();
      await expect(page.getByText(/¡Lo lograste!/).first()).toBeVisible();
    }
    if (s.phase === "Terminé") {
      await page.getByRole("radio", { name: /Necesité una pista/ }).check();
      await page.getByRole("button", { name: "Guardar y terminar" }).click();
      await expect(page.getByText(/Tu trabajo quedó guardado/)).toBeVisible();
    } else await next(page);
  }
  await expect
    .poll(() => page.locator(".offline-status").textContent())
    .toContain("preparados");
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: /Semilla/ }).click();
  await page.getByRole("button", { name: "Volver a revisar" }).click();
  await expect(
    page.getByRole("heading", { name: "Comparte lo que aprendiste" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("audio")
        .first()
        .evaluate((a: HTMLAudioElement) => a.duration),
    )
    .toBeGreaterThan(1);
  await page.getByRole("button", { name: "← Atrás", exact: true }).click();
  await page.getByLabel("Tu respuesta").fill("20");
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/¡Lo lograste!/).first()).toBeVisible();
  await next(page);
  await page.getByRole("button", { name: "Docente", exact: false }).click();
  await expect(page.getByText("33 / 33 pantallas")).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  const download = await pending;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const c of stream!) chunks.push(c);
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  const attempts = exported.progress[0].attempts["evaluacion-problema"];
  expect(attempts[0].correct).toBe(false);
  expect(attempts[1].correct).toBe(true);
  expect(attempts[1].hints).toBe(1);
  expect(exported.progress[0].finished).toBe(true);
  expect(remote).toEqual([]);
});
test("accesibilidad: teclado, tamaño, contraste y ausencia de infracciones serias", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "¡Hola! ¿Quién aprende hoy?" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByText("Saltar al contenido")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Texto grande" }).click();
  await page.getByRole("button", { name: "Alto contraste" }).click();
  expect(
    await page.locator("html").evaluate((e) => getComputedStyle(e).fontSize),
  ).toBe("23px");
  let report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await create(page);
  await next(page);
  report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.screenshot({
    path: "test-results/accesibilidad.png",
    fullPage: true,
  });
});
test("un fallo de almacenamiento impide avanzar silenciosamente", async ({
  page,
}) => {
  await create(page);
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Cuota agotada", "QuotaExceededError");
    };
  });
  await next(page);
  await expect(page.getByRole("alert")).toContainText("No pudimos guardar");
  await expect(
    page.getByRole("heading", { name: "¡Bienvenido a la huerta!" }),
  ).toBeVisible();
});
test("la ruta funciona en pantalla estrecha sin desplazamiento horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await create(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await next(page);
  await page.getByLabel("Tu respuesta").fill("12");
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByRole("button", { name: "Continuar →" })).toBeEnabled();
});
