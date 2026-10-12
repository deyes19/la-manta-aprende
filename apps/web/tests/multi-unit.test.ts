import { describe, it, expect } from "vitest";
import "fake-indexeddb/auto";
import { pilot, type Step, type Unit } from "../src/data/content";
import { unitSchema } from "../../../packages/content-schema";
import { isCorrect } from "../src/features/lessons/Activity";
import { rows } from "../src/features/analytics/report";
import {
  newProgress,
  saveProgress,
  loadProgress,
  type Profile,
} from "../src/offline/store";
function textStep(): Step {
  return {
    ...pilot.steps.find((s) => s.activity)!,
    id: "fixture-lectura",
    activity: {
      kind: "text",
      prompt: "Escribe árbol.",
      answer: "árbol",
      objective: "escritura",
      explanation: "Árbol se escribe con tilde.",
    },
  };
}
describe("motor para distintas áreas", () => {
  it("permite objetivos de lectura y escritura sin imponer objetivos matemáticos", () => {
    const u = structuredClone(pilot);
    u.id = "fixture-lengua";
    u.subject = "Lengua Castellana";
    u.curriculum.objectives = ["escritura"];
    u.steps = u.steps.map((s) =>
      s.activity
        ? { ...s, activity: { ...s.activity, objective: "escritura" } }
        : s,
    );
    expect(unitSchema.parse(u).subject).toBe("Lengua Castellana");
    u.curriculum.objectives = ["comprension_no_evaluada"];
    expect(() => unitSchema.parse(u)).toThrow();
  });
  it("comprueba escritura sin ignorar tildes significativas", () => {
    const s = textStep();
    expect(isCorrect(s, " ÁRBOL ", [])).toBe(true);
    expect(isCorrect(s, "arbol", [])).toBe(false);
    expect(isCorrect(s, "", [])).toBe(false);
  });
  it("comprueba secuencias completas y rechaza órdenes o elementos inconsistentes", () => {
    const s: Step = {
      ...textStep(),
      activity: {
        kind: "order",
        prompt: "Ordena las acciones.",
        answer: "Observar|Conversar|Acordar",
        choices: ["Conversar", "Acordar", "Observar"],
        objective: "secuencia",
        explanation: "Primero observar, luego conversar y finalmente acordar.",
      },
    };
    expect(isCorrect(s, "Observar|Conversar|Acordar", [])).toBe(true);
    expect(isCorrect(s, "Conversar|Observar|Acordar", [])).toBe(false);
    const u = structuredClone(pilot);
    u.steps[1] = s;
    expect(unitSchema.safeParse(u).success).toBe(true);
    s.activity!.choices = ["Observar", "Observar", "Acordar"];
    u.steps[1] = s;
    expect(unitSchema.safeParse(u).success).toBe(false);
  });
  it("separa progreso y reportes por unidad sin atribuir el avance a otra materia", async () => {
    const p: Profile = {
      id: "fixture-multi",
      alias: "Sol",
      grade: 2,
      group: "Aula",
      avatar: "🌻",
      support: "guiado",
      assigned: false,
    };
    const lengua: Unit = {
      ...pilot,
      id: "fixture-lengua",
      subject: "Lengua Castellana",
    };
    const math = newProgress(p.id, pilot.id, pilot.version);
    math.index = 10;
    const lang = newProgress(p.id, lengua.id, 1);
    lang.index = 2;
    await saveProgress(math);
    await saveProgress(lang);
    expect((await loadProgress(p.id, pilot.id))?.index).toBe(10);
    expect((await loadProgress(p.id, lengua.id))?.index).toBe(2);
    const report = rows([p], [math, lang], [pilot, lengua]);
    expect(report.filter((r) => r.asignatura === "Matemáticas")).toHaveLength(
      4,
    );
    expect(
      report.filter((r) => r.asignatura === "Lengua Castellana"),
    ).toHaveLength(4);
    expect(
      rows([{ ...p, grade: 5 }], [math, lang], [pilot, lengua]),
    ).toHaveLength(0);
  });
  it("rechaza una copia del flujo de primaria para transición", () => {
    expect(unitSchema.safeParse({ ...pilot, grade: 0 }).success).toBe(false);
    expect(
      unitSchema.safeParse({ ...pilot, grade: 0, approach: "preschool" })
        .success,
    ).toBe(false);
  });
});
