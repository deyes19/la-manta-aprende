import type { Profile, Progress } from "../../offline/store";
import { pilot } from "../../data/content";
export function rows(profiles: Profile[], progress: Progress[]) {
  return profiles.flatMap((p) => {
    const r = progress.find(
      (r) => r.profileId === p.id && r.unitId === pilot.id,
    );
    return pilot.steps
      .filter((s) => s.phase === "Demuestro lo aprendido")
      .map((s) => {
        const a = r?.attempts[s.id] ?? [];
        return {
          perfilId: p.id,
          alias: p.alias,
          grupo: p.group,
          grado: p.grade,
          unidad: pilot.id,
          version: r?.version ?? pilot.version,
          estadoCurricular: pilot.source.status,
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
        };
      });
  });
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
