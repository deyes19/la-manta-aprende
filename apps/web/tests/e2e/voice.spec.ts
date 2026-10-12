import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("elige voz, repite, detiene y conserva elección con respaldo offline", async ({
  page,
  context,
}) => {
  // Simulated voices verify integration; they do not validate audible quality on Windows.
  await page.addInitScript(() => {
    const target = new EventTarget();
    const local = {
      name: "Helena",
      lang: "es-ES",
      localService: true,
      default: true,
      voiceURI: "local-es",
    };
    const cloud = {
      name: "Salomé",
      lang: "es-CO",
      localService: false,
      default: false,
      voiceURI: "cloud-co",
    };
    const state = {
      calls: [] as { text: string; voice: string; rate: number }[],
      cancels: 0,
      loaded: false,
    };
    Object.defineProperty(window, "voiceTest", { value: state });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: Object.assign(target, {
        getVoices: () => (state.loaded ? [local, cloud] : []),
        speak: (u: SpeechSynthesisUtterance) => {
          state.calls.push({
            text: u.text,
            voice: u.voice!.voiceURI,
            rate: u.rate,
          });
          setTimeout(() => u.onstart?.({} as SpeechSynthesisEvent), 0);
        },
        cancel: () => state.cancels++,
      }),
    });
    setTimeout(() => {
      state.loaded = true;
      target.dispatchEvent(new Event("voiceschanged"));
    }, 500);
  });
  await page.goto("/");
  await page.getByText("Elegir voz", { exact: false }).click();
  await expect(page.getByLabel("Voz en español")).toContainText("Salomé");
  await page.getByLabel("Voz en español").selectOption("cloud-co");
  await page.getByRole("button", { name: "Probar voz" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).voiceTest.calls.at(-1)?.voice),
    )
    .toBe("cloud-co");
  await page.getByRole("button", { name: "Detener prueba" }).click();
  await page.getByLabel("Voz en español").selectOption("local-es");
  await page.getByLabel("Velocidad").selectOption("0.8");
  await page.getByRole("button", { name: "Escuchar instrucciones" }).click();
  await expect(
    page.getByRole("button", { name: "Detener", exact: false }).last(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).voiceTest.calls.at(-1)?.rate),
    )
    .toBe(0.8);
  const before = await page.evaluate(
    () => (window as any).voiceTest.calls.length,
  );
  await page.getByRole("button", { name: "Repetir" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).voiceTest.calls.length))
    .toBe(before + 1);
  await page.getByRole("button", { name: "⏹ Detener", exact: true }).click();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  // A saved cloud voice cannot become an offline requirement.
  await page.getByLabel("Voz en español").selectOption("cloud-co");
  await expect
    .poll(() => page.locator(".offline-status").textContent(), {
      timeout: 120000,
    })
    .toContain("preparados");
  await context.setOffline(true);
  await page.reload();
  await page.getByText("Elegir voz", { exact: false }).click();
  await expect(page.getByLabel("Voz en español")).toHaveValue("cloud-co");
  await expect(
    page.getByText("Voz disponible: Helena", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Probar voz" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).voiceTest.calls.at(-1)?.voice),
    )
    .toBe("local-es");
});

test("si el sintetizador falla, reproduce MP3 local y permite elegir audios guardados", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: Object.assign(new EventTarget(), {
        getVoices: () => [
          {
            name: "Helena",
            lang: "es-ES",
            localService: true,
            voiceURI: "local-es",
          },
        ],
        speak: (u: SpeechSynthesisUtterance) =>
          setTimeout(() => u.onerror?.({} as SpeechSynthesisErrorEvent), 0),
        cancel: () => {},
      }),
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Escuchar instrucciones" }).click();
  await expect(
    page.getByText(
      "La voz del navegador no pudo hablar. Usamos el audio guardado.",
    ),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime),
    )
    .toBeGreaterThan(0);
  await page.getByText("Elegir voz", { exact: false }).click();
  await page
    .getByRole("combobox", { name: "Narración", exact: true })
    .selectOption("recorded");
  await page.reload();
  await page.getByText("Elegir voz", { exact: false }).click();
  await expect(
    page.getByRole("combobox", { name: "Narración", exact: true }),
  ).toHaveValue("recorded");
  await page.getByRole("button", { name: "Escuchar instrucciones" }).click();
  await expect
    .poll(() =>
      page.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime),
    )
    .toBeGreaterThan(0);
});
