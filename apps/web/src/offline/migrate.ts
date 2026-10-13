import type { Unit } from "../data/content";
import type { Progress } from "./store";

// Reordering must never interpret the old numeric index as a new screen.
export function migrateProgress(
  record: Progress,
  unit: Unit,
): Progress | undefined {
  if (record.unitId !== unit.id) return undefined;
  if (record.version === unit.version) return record;
  const migration = unit.migrations?.find(
    (m) => m.fromVersion === record.version,
  );
  if (!migration || !migration.stepOrder[record.index]) return undefined;
  const known = new Set(migration.stepOrder);
  if (record.completed.some((id) => !known.has(id))) return undefined;
  const completed = new Set(record.completed);
  for (const [parent, children] of Object.entries(migration.completedFrom))
    if (completed.has(parent)) children.forEach((id) => completed.add(id));
  const firstMissing = unit.steps.findIndex((s) => !completed.has(s.id));
  return {
    ...record,
    version: unit.version,
    completed: unit.steps.filter((s) => completed.has(s.id)).map((s) => s.id),
    index:
      record.finished || firstMissing < 0
        ? unit.steps.length - 1
        : firstMissing,
    updatedAt: new Date().toISOString(),
  };
}
