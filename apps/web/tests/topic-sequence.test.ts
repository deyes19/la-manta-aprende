import { expect, it } from "vitest";
import { units, pilot } from "../src/data/content";
import { unitSchema } from "../../../packages/content-schema";
import { newProgress } from "../src/offline/store";
import { migrateProgress } from "../src/offline/migrate";
import { isCorrect } from "../src/features/lessons/Activity";

it("todas las unidades de primaria completan aprendizaje, cuaderno y práctica de cada tema antes del siguiente", () => {
  for (const unit of units.filter((u) => u.approach === "primary")) {
    expect(unit.topics!.length).toBeGreaterThan(0);
    for (const topic of unit.topics!) {
      const indexes = unit.steps.flatMap((s, i) =>
        s.topic?.id === topic.id ? [i] : [],
      );
      expect(indexes.at(-1)! - indexes[0] + 1).toBe(indexes.length);
      expect(unit.steps[indexes[0]].phase).toBe("Aprendo");
      expect(unit.steps[indexes.at(-1)!].phase).toBe("Practico");
      expect(indexes.some((i) => unit.steps[i].phase === "Mi cuaderno")).toBe(
        true,
      );
    }
  }
});
it("no permite que el siguiente tema empiece entre la copia y la práctica", () => {
  const unit = structuredClone(pilot);
  const index = unit.steps.findIndex((s) => s.id === "tabla-2");
  const [step] = unit.steps.splice(index, 1);
  unit.steps.splice(
    unit.steps.findIndex((s) => s.id === "cuaderno-idea"),
    0,
    step,
  );
  expect(unitSchema.safeParse(unit).success).toBe(false);
});
it("cada revisión sigue al ejercicio de su tema y los ejemplos ofrecen modelos para dibujar", () => {
  for (const unit of units.filter(
    (u) => u.approach === "primary" && u.id !== pilot.id,
  )) {
    for (const [i, s] of unit.steps.entries()) {
      if (s.title.startsWith("Revisa el ejercicio")) {
        expect(unit.steps[i - 1].title).toMatch(/^Resuelve el ejercicio/);
        expect(unit.steps[i - 1].topic?.id).toBe(s.topic?.id);
      }
      if (s.id.endsWith("-ejemplo"))
        expect(s.visual || s.drawingModel).toBeTruthy();
    }
  }
});
it("separa inversos z, x y d; no solicita otras letras antes de aprenderlas", () => {
  const unit = units.find((u) => u.id.includes("inversos-oraciones"))!;
  const first = unit.steps.filter((s) => s.topic?.id === "tema-1");
  expect(first.flatMap((s) => s.text).join(" ")).not.toContain("ax, ex");
  expect(first.flatMap((s) => s.text).join(" ")).not.toContain("ad, ed");
});
it("la migración conserva intentos, ayudas, observación y productos y retoma el primer paso pendiente", () => {
  const unit = units.find((u) => u.id.includes("inversos-oraciones"))!;
  const original = newProgress("sol", unit.id, 1);
  original.index = 15;
  original.completed = unit.migrations![0].stepOrder.slice(0, 15);
  original.attempts = {
    evaluacion: [{ value: "respuesta", correct: false, hints: 1, at: "antes" }],
  };
  original.hints = { evaluacion: 1 };
  original.products = { dibujo: ["🌱"] };
  original.teacherReview = { note: "Observado", at: "antes" };
  const unchanged = structuredClone(original);
  const migrated = migrateProgress(original, unit)!;
  expect(migrated.version).toBe(2);
  expect(migrated.attempts).toEqual(original.attempts);
  expect(migrated.hints).toEqual(original.hints);
  expect(migrated.products).toEqual(original.products);
  expect(migrated.teacherReview).toEqual(original.teacherReview);
  expect(unit.steps[migrated.index].topic?.id).toBe("tema-1");
  expect(original).toEqual(unchanged);
  expect(migrated.completed).toContain(
    unit.steps.find(
      (s) => s.id.endsWith("-titulo") && s.topic?.id === "tema-1",
    )!.id,
  );
});
it("conserva recorridos terminados y no sobrescribe versiones desconocidas", () => {
  const original = newProgress("sol", pilot.id, 1);
  original.completed = pilot.migrations![0].stepOrder;
  original.index = 32;
  original.finished = true;
  const migrated = migrateProgress(original, pilot)!;
  expect(migrated.finished).toBe(true);
  expect(pilot.steps[migrated.index].phase).toBe("Terminé");
  expect(migrated.completed).toHaveLength(33);
  expect(migrateProgress({ ...original, version: 99 }, pilot)).toBeUndefined();
  expect(migrateProgress({ ...original, index: 999 }, pilot)).toBeUndefined();
});
it("en fracciones el reparto comprueba igualdad de grupos, además del total", () => {
  const unit = units.find((u) =>
    u.id.includes("g3-matematicas-p4-fracciones"),
  )!;
  const s = unit.steps.find(
    (s) =>
      s.phase === "Practico" &&
      s.activity?.kind === "groups" &&
      s.activity.objective === "partes",
  )!;
  expect(isCorrect(s, "12", [3, 3, 3, 3])).toBe(true);
  expect(isCorrect(s, "12", [2, 4, 3, 3])).toBe(false);
  const colored = unit.steps.find(
    (s) => s.phase === "Practico" && s.activity?.kind === "fraction",
  )!;
  expect(isCorrect(colored, "", [0, 1, 2])).toBe(true);
  expect(isCorrect(colored, "", [0, 1])).toBe(false);
  expect(isCorrect(colored, "", [0, 0, 1])).toBe(false);
  expect(isCorrect(colored, "", [0, 1, 99])).toBe(false);
});
