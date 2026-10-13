import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { unitSchema } from "../../../packages/content-schema";
import { pilot } from "../src/data/content";
import { isCorrect } from "../src/features/lessons/Activity";
import {
  profiles,
  putProfile,
  saveProgress,
  loadProgress,
  newProgress,
  allProgress,
  deleteProfile,
  type Profile,
} from "../src/offline/store";
import { rows, toCSV } from "../src/features/analytics/report";
const profile: Profile = {
  id: "sol",
  alias: "Sol",
  grade: 2,
  avatar: "🌻",
  group: "Segundo",
  support: "guiado",
  assigned: false,
};
beforeEach(async () => {
  for (const p of await profiles()) await deleteProfile(p.id);
});
describe("contenido y actividades", () => {
  it("valida ocho momentos y evita cuaderno vacío o respuestas inválidas", () => {
    expect(unitSchema.parse(pilot).steps).toHaveLength(33);
    const copy = structuredClone(pilot);
    copy.steps.find((s) => s.phase === "Mi cuaderno")!.text = [];
    expect(() => unitSchema.parse(copy)).toThrow();
    const other = structuredClone(pilot);
    other.steps.find((s) => s.activity?.kind === "choice")!.activity!.answer =
      "no existe";
    expect(() => unitSchema.parse(other)).toThrow();
  });
  it("comprueba los grupos de las tablas 2–5 y rechaza un total sin reparto", () => {
    for (const n of [2, 3, 4, 5]) {
      const s = pilot.steps.find((s) => s.id === `practica-${n}`)!;
      expect(isCorrect(s, "", Array(s.groups![0]).fill(n))).toBe(true);
      expect(isCorrect(s, String(s.activity!.answer), [])).toBe(false);
      expect(isCorrect(s, "", [])).toBe(false);
      expect(isCorrect(s, "99", [])).toBe(false);
    }
  });
  it("comprueba cada grupo, no solo el total", () => {
    const s = pilot.steps.find((s) => s.id === "mision")!;
    expect(isCorrect(s, 20, [4, 4, 4, 4, 4])).toBe(true);
    expect(isCorrect(s, 20, [3, 5, 4, 4, 4])).toBe(false);
  });
});
describe("persistencia y reportes", () => {
  it("reanuda pasos y preserva primer intento, ayudas y aislamiento entre perfiles", async () => {
    await putProfile(profile);
    const r = newProgress(profile.id, pilot.id, 1);
    r.index = 12;
    r.hints["evaluacion-problema"] = 1;
    r.attempts["evaluacion-problema"] = [
      { value: 12, correct: false, at: "2026-10-12", hints: 0 },
      { value: 20, correct: true, at: "2026-10-12", hints: 1 },
    ];
    await saveProgress(r);
    expect((await loadProgress("sol", pilot.id))?.index).toBe(12);
    expect(await loadProgress("otro", pilot.id)).toBeUndefined();
    const row = rows([profile], await allProgress()).find(
      (r) => r.objetivo === "problemas",
    )!;
    expect(row.primerIntento).toBe("por_revisar");
    expect(row.intentos).toBe(2);
    expect(row.ayudas).toBe(1);
  });
  it("conserva alias duplicados como identidades distintas y protege CSV de fórmulas", async () => {
    const p2 = { ...profile, id: "otro", alias: "=1+1" };
    await putProfile(profile);
    await putProfile(p2);
    expect(await profiles()).toHaveLength(2);
    const csv = toCSV(rows([p2], []));
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain("autodeclaracion_no_verificada");
  });
  it("borra únicamente el perfil y avances seleccionados", async () => {
    await putProfile(profile);
    await putProfile({ ...profile, id: "otro" });
    await saveProgress(newProgress("sol", pilot.id, 1));
    await saveProgress(newProgress("otro", pilot.id, 1));
    await deleteProfile("sol");
    expect(await loadProgress("sol", pilot.id)).toBeUndefined();
    expect(await loadProgress("otro", pilot.id)).toBeDefined();
    expect(await profiles()).toHaveLength(1);
  });
});
