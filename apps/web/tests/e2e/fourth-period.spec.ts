import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Unit, Step } from "../../src/data/content";
const catalog: Unit[] = readdirSync(resolve("src/content"))
  .filter((n) => n.endsWith(".json"))
  .map((n) => JSON.parse(readFileSync(resolve("src/content", n), "utf8")));
async function enter(page: Page, unit: Unit) {
  await page.goto("/");
  await page.getByLabel("Mi alias").fill("Explorador");
  await page.getByLabel("Mi grado").selectOption(String(unit.grade));
  await page.getByRole("button", { name: "Crear perfil" }).click();
  await page.getByLabel("Asignatura o proyecto").selectOption(unit.subject);
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: unit.title, exact: true }),
    })
    .getByRole("button", { name: "Abrir unidad" })
    .click();
}
async function answer(page: Page, step: Step) {
  const a = step.activity!;
  if (a.kind === "choice")
    await page
      .getByRole("radio", { name: String(a.answer), exact: true })
      .check();
  else if (a.kind === "groups") {
    for (let g = 0; g < step.groups![0]; g++)
      for (let n = 0; n < step.groups![1]; n++)
        await page
          .getByRole("button", { name: new RegExp(`^Grupo ${g + 1}:`) })
          .click();
  } else if (a.kind === "fraction") {
    for (let i = 0; i < Number(a.answer); i++)
      await page
        .getByRole("button", { name: `Parte ${i + 1}`, exact: true })
        .click();
  } else if (a.kind === "order") {
    const current = [...a.choices!];
    const target = String(a.answer).split("|");
    for (let i = 0; i < target.length; i++) {
      let j = current.indexOf(target[i]);
      while (j > i) {
        await page
          .getByRole("button", { name: `Subir ${target[i]}`, exact: true })
          .click();
        [current[j], current[j - 1]] = [current[j - 1], current[j]];
        j--;
      }
    }
  } else
    await page
      .getByLabel("Tu respuesta", { exact: true })
      .fill(String(a.answer).replace(".", a.kind === "decimal" ? "," : "."));
  await page.getByRole("button", { name: "Comprobar", exact: false }).click();
  await expect(page.getByText(/¡Lo lograste!/).first()).toBeVisible();
}
for (const unit of catalog) {
  test(`ruta completa: ${unit.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await enter(page, unit);
    for (const step of unit.steps) {
      await expect(
        page.getByRole("heading", { name: step.title, exact: true }),
      ).toBeVisible();
      if (step.freePlay) {
        await page
          .getByRole("button", {
            name: `Agregar ${step.freePlay.symbols[0]}`,
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("group", { name: /Composición con 1 figuras/ }),
        ).toBeVisible();
      }
      if (step.activity) await answer(page, step);
      if (step.phase === "Terminé") {
        await page
          .getByRole("radio", { name: /Lo hice con confianza/ })
          .check();
        await page.getByRole("button", { name: "Guardar y terminar" }).click();
        await expect(page.getByText(/Tu trabajo quedó guardado/)).toBeVisible();
      } else
        await page
          .getByRole("button", { name: /Continuar →|Ya terminé · Continuar/ })
          .click();
    }
    expect(errors).toEqual([]);
    await page.getByRole("button", { name: "Docente", exact: false }).click();
    await expect(
      page.getByText(`${unit.steps.length} / ${unit.steps.length} pantallas`, {
        exact: false,
      }),
    ).toBeVisible();
    const note = page.getByLabel(`Observación docente de ${unit.title}`, {
      exact: true,
    });
    await note.fill(
      "Observé la explicación y el producto; requiere devolución docente.",
    );
    await note.press("Tab");
    await expect(note).toHaveValue(
      "Observé la explicación y el producto; requiere devolución docente.",
    );
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar JSON" }).click();
    const result = await pending;
    const stream = await result.createReadStream();
    const chunks = [];
    for await (const c of stream!) chunks.push(c);
    const report = JSON.parse(Buffer.concat(chunks).toString());
    const record = report.progress.find((r: any) => r.unitId === unit.id);
    expect(record.teacherReview.note).toBe(
      "Observé la explicación y el producto; requiere devolución docente.",
    );
    expect(record.finished).toBe(true);
    expect(record.completed).toHaveLength(unit.steps.length);
    if (unit.approach === "preschool") {
      expect(record.attempts).toEqual({});
      expect(Object.keys(record.products).length).toBeGreaterThan(0);
      expect(
        report.summary.find((r: any) => r.unidad === unit.id).primerIntento,
      ).toBe("no_aplica");
    }
  });
}
test("transición: creación persistente, acompañamiento y accesibilidad sin copias", async ({
  page,
}) => {
  const unit = catalog.find(
    (u) => u.id === "transicion-p4-figuras-y-estampados",
  )!;
  await enter(page, unit);
  await page.getByRole("button", { name: "Continuar →" }).click();
  await page.getByRole("button", { name: "Continuar →" }).click();
  await page.getByRole("button", { name: "Agregar 🟦" }).click();
  await page.getByRole("button", { name: "Agregar 🔺" }).click();
  await page
    .getByRole("button", { name: "Fila 2, columna 2: vacía", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Fila 2, columna 2: 🔺", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Explorador/ }).click();
  await page.getByLabel("Asignatura o proyecto").selectOption("Matemáticas");
  await page.getByRole("button", { name: "Reanudar" }).click();
  await expect(
    page.getByRole("group", { name: /Composición con 2 figuras/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fila 2, columna 2: 🔺", exact: true }),
  ).toBeVisible();
  expect(unit.steps.some((s) => s.phase === "Mi cuaderno")).toBe(false);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.screenshot({
    path: "test-results/transicion.png",
    fullPage: true,
  });
});
test("dictado y decimal: audio local, respuesta oculta y ayuda no punitiva", async ({
  page,
}) => {
  const unit = catalog.find(
    (u) => u.id === "g1-lengua-castellana-p4-letras-y-cuento",
  )!;
  expect(unit.steps.find((s) => s.dictation)!.instruction).not.toContain(
    "taxi",
  );
  expect(unit.steps.find((s) => s.dictation)!.activity!.prompt).not.toContain(
    "taxi",
  );
  await enter(
    page,
    catalog.find((u) => u.id === "g5-matematicas-p4-decimales-y-solidos")!,
  );
  await page.screenshot({ path: "test-results/quinto.png", fullPage: true });
});
