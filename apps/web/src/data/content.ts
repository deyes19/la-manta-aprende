import { rawUnits } from "../content/catalog";
import { unitSchema } from "../../../../packages/content-schema";
export const units = rawUnits.map((data) => unitSchema.parse(data));
export const pilot = units.find(
  (u) => u.id === "g2-matematicas-p4-multiplicacion",
)!;
export function findUnit(id: string) {
  return units.find((u) => u.id === id);
}
export const gradeLabel = (grade: number) =>
  grade === 0 ? "Transición" : `Grado ${grade}`;
export type { Step, Unit } from "../../../../packages/content-schema";
