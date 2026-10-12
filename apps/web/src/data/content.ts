import data from "../content/pilot.json";
import { unitSchema } from "../../../../packages/content-schema";
export const pilot = unitSchema.parse(data);
// Registro de unidades ejecutables; la cobertura pendiente no se presenta como lecciones.
export const units = [pilot];
export function findUnit(id: string) {
  return units.find((unit) => unit.id === id);
}
export const gradeLabel = (grade: number) =>
  grade === 0 ? "Transición" : `Grado ${grade}`;

export type { Step, Unit } from "../../../../packages/content-schema";
