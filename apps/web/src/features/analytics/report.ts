import type { Profile, Progress } from "../../offline/store";
import { units, type Unit } from "../../data/content";
export function rows(
  profiles: Profile[],
  progress: Progress[],
  catalog: Unit[] = units,
) {
  return profiles.flatMap((p) =>
    catalog
      .filter((unit) => unit.grade === p.grade)
      .flatMap((unit) => {
        const r = progress.find(
          (r) => r.profileId === p.id && r.unitId === unit.id,
        );
        if (unit.approach === "preschool")
          return [
            {
              perfilId: p.id,
              alias: p.alias,
              grupo: p.group,
              grado: p.grade,
              unidad: unit.id,
              asignatura: unit.subject,
              periodo: unit.period,
              version: r?.version ?? unit.version,
              estadoCurricular: unit.source.status,
              objetivo: "expresion_y_participacion_observada",
              primerIntento: "no_aplica",
              intentos: 0,
              ayudas: Object.values(r?.hints ?? {}).reduce((a, b) => a + b, 0),
              logro: r?.teacherReview?.note
                ? "observacion_docente_registrada"
                : "requiere_observacion_docente",
              terminado: r?.finished ?? false,
              cuaderno: "no_aplica_transicion",
              autoevaluacion: r?.selfReport ?? "",
              actualizado: r?.updatedAt ?? "",
              observacionDocente: r?.teacherReview?.note ?? "",
            },
          ];
        return unit.steps
          .filter((s) => s.phase === "Demuestro lo aprendido" && s.activity)
          .map((s) => {
            const a = r?.attempts[s.id] ?? [];
            return {
              perfilId: p.id,
              alias: p.alias,
              grupo: p.group,
              grado: p.grade,
              unidad: unit.id,
              asignatura: unit.subject,
              periodo: unit.period,
              version: r?.version ?? unit.version,
              estadoCurricular: unit.source.status,
              objetivo: s.activity!.objective,
              primerIntento: a.length
                ? a[0].correct
                  ? "acierto"
                  : "por_revisar"
                : "sin_responder",
              intentos: a.length,
              ayudas: r?.hints[s.id] ?? 0,
              logro: a.some((t) => t.correct)
                ? "demostrado_con_registro_de_apoyos"
                : "pendiente",
              terminado: r?.finished ?? false,
              cuaderno: "autodeclaracion_no_verificada",
              autoevaluacion: r?.selfReport ?? "",
              actualizado: r?.updatedAt ?? "",
              observacionDocente: r?.teacherReview?.note ?? "",
            };
          });
      }),
  );
}
const cell = (v: unknown) => {
  let t = String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return '"' + t.replaceAll('"', '""') + '"';
};
export function toCSV(data: ReturnType<typeof rows>) {
  if (!data.length) return "";
  const keys = Object.keys(data[0]) as (keyof (typeof data)[number])[];
  return (
    "\uFEFF" +
    [
      keys.map(cell).join(","),
      ...data.map((r) => keys.map((k) => cell(r[k])).join(",")),
    ].join("\r\n")
  );
}
export function download(name: string, body: string, type: string) {
  const u = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
