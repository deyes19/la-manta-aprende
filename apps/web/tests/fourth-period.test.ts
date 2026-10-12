import { describe, it, expect } from "vitest";
import { units, pilot, type Step } from "../src/data/content";
import { isCorrect } from "../src/features/lessons/Activity";
import { unitSchema } from "../../../packages/content-schema";
import { rows } from "../src/features/analytics/report";
import { newProgress, type Profile } from "../src/offline/store";
import { readFileSync } from "node:fs";
describe("cuarto período consultado", () => {
  it("cubre cada grado y área con rutas ejecutables, no unidades vacías", () => {
    expect(units).toHaveLength(19);
    for (const grade of [0, 1, 2, 3, 4, 5])
      for (const subject of [
        "Matemáticas",
        "Lengua Castellana",
        "Ciencias Sociales",
      ]) {
        const list = units.filter(
          (u) => u.grade === grade && u.subject === subject && u.period === 4,
        );
        expect(list.length).toBeGreaterThan(0);
        for (const u of list) {
          expect(u.steps.length).toBeGreaterThanOrEqual(10);
          expect(u.source.status).toBe("FUENTE_CONSULTADA");
        }
      }
  });
  it("relaciona aprendizajes y evidencias con las columnas reales, que difieren en Matemáticas", () => {
    const u = units.find((u) => u.id === "g3-matematicas-p4-fracciones")!;
    expect(u.curriculum.evidence).toContain(
      "Representar gráfica y simbólicamente fracciones comunes en contextos continuos y discretos",
    );
    expect(u.curriculum.learning).toContain(
      "Usar fracciones comunes para describir situaciones continuas y discretas",
    );
  });
  it("maneja coma y punto decimal y rechaza cantidades mal formadas", () => {
    const s = units
      .find((u) => u.grade === 4 && u.subject === "Matemáticas")!
      .steps.find((s) => s.activity?.kind === "decimal")!;
    expect(isCorrect(s, "1,75", [])).toBe(true);
    expect(isCorrect(s, "1.75", [])).toBe(true);
    expect(isCorrect(s, "1,7,5", [])).toBe(false);
    expect(isCorrect(s, "", [])).toBe(false);
  });
  it("comprueba representación de fracciones, no la declaración de un dibujo", () => {
    const s = units
      .find((u) => u.grade === 3 && u.subject === "Matemáticas")!
      .steps.find((s) => s.activity?.kind === "fraction")!;
    expect(isCorrect(s, "", [0, 1, 2])).toBe(true);
    expect(isCorrect(s, "", [0, 1])).toBe(false);
  });
  it("preserva el piloto y diferencia cuarto y quinto aunque compartan malla", () => {
    expect(pilot.version).toBe(1);
    expect(pilot.steps).toHaveLength(33);
    const fourth = units.find(
      (u) => u.grade === 4 && u.subject === "Lengua Castellana",
    )!;
    const fifth = units.find(
      (u) => u.grade === 5 && u.subject === "Lengua Castellana",
    )!;
    expect(fourth.source.file).toBe(fifth.source.file);
    expect(
      fourth.steps.find((s) => s.phase === "Mi misión")!.instruction,
    ).not.toBe(fifth.steps.find((s) => s.phase === "Mi misión")!.instruction);
  });
  it("registra transición como participación/observación, sin atribuir aciertos o escritura", () => {
    const unit = units.find((u) => u.approach === "preschool")!;
    const profile: Profile = {
      id: "juego",
      alias: "Flor",
      grade: 0,
      avatar: "🌻",
      group: "Villanueva",
      support: "guiado",
      assigned: false,
    };
    const record = newProgress(profile.id, unit.id, 1);
    record.products = { [unit.steps.find((s) => s.freePlay)!.id]: ["⚪"] };
    record.finished = true;
    const row = rows([profile], [record], [unit])[0];
    expect(row.primerIntento).toBe("no_aplica");
    expect(row.cuaderno).toBe("no_aplica_transicion");
    expect(row.logro).toBe("requiere_observacion_docente");
    expect(
      unit.steps.some((s) => s.phase === "Mi cuaderno" || s.activity),
    ).toBe(false);
  });
  it("el dictado está en la locución local y no en el texto de la pregunta", () => {
    const s = units
      .find((u) => u.grade === 1 && u.subject === "Lengua Castellana")!
      .steps.find((s) => s.dictation)!;
    const transcripts = JSON.parse(
      readFileSync("public/audio/transcripts.json", "utf8"),
    );
    expect(transcripts[s.id]).toContain("La palabra para el dictado es: taxi.");
    expect(s.activity!.prompt).not.toContain("taxi");
  });
});
