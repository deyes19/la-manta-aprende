import { useState } from "react";
import { units, gradeLabel } from "../../data/content";
import {
  deleteProfile,
  putProfile,
  type Profile,
  type Progress,
} from "../../offline/store";
import { rows, toCSV, download } from "../analytics/report";
export function Dashboard({
  profiles,
  progress,
  refresh,
}: {
  profiles: Profile[];
  progress: Progress[];
  refresh: () => Promise<void>;
}) {
  const [group, setGroup] = useState("");
  const [student, setStudent] = useState("");
  const [unitId, setUnitId] = useState("");
  const [error, setError] = useState("");
  const [remove, setRemove] = useState("");
  const filtered = profiles.filter(
    (p) => (!group || p.group === group) && (!student || p.id === student),
  );
  const catalog = units.filter((u) => !unitId || u.id === unitId);
  const data = rows(filtered, progress, catalog);
  async function change(p: Profile, patch: Partial<Profile>) {
    try {
      await putProfile({ ...p, ...patch });
      await refresh();
    } catch {
      setError("No fue posible guardar el ajuste. Inténtalo de nuevo.");
    }
  }
  return (
    <section>
      <p className="eyebrow">Aula multigrado · sede Villanueva</p>
      <h2>Panel docente</h2>
      <p>
        Los resultados describen actividades, no notas oficiales. El cuaderno y
        las producciones requieren observación docente.
      </p>
      <div className="warning">
        <strong>Revisión curricular y pedagógica</strong>
        <p>
          Cobertura solicitada: transición a quinto, cuarto período,
          Matemáticas, Lengua Castellana y Ciencias Sociales. Solo se muestran
          unidades ejecutables. Consulta el estado y el localizador de fuente de
          cada unidad; los temas pendientes no se presentan como desarrollados.
        </p>
      </div>
      <div className="filters">
        <label>
          Grupo
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setStudent("");
            }}
          >
            <option value="">Todos</option>
            {[...new Set(profiles.map((p) => p.group))].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          Estudiante
          <select value={student} onChange={(e) => setStudent(e.target.value)}>
            <option value="">Todos</option>
            {profiles
              .filter((p) => !group || p.group === group)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias}
                </option>
              ))}
          </select>
        </label>
        <label>
          Unidad
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            <option value="">Todas las unidades</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {gradeLabel(u.grade)} · {u.subject} · {u.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="toolbar">
        <button
          disabled={!data.length}
          onClick={() =>
            download(
              "manta-resultados.csv",
              toCSV(data),
              "text/csv;charset=utf-8",
            )
          }
        >
          ↓ Exportar CSV
        </button>
        <button
          disabled={!filtered.length}
          onClick={() =>
            download(
              "manta-evidencias.json",
              JSON.stringify(
                {
                  schemaVersion: 2,
                  exportedAt: new Date().toISOString(),
                  units: catalog.map((u) => ({
                    id: u.id,
                    version: u.version,
                    grade: u.grade,
                    subject: u.subject,
                    period: u.period,
                    source: u.source,
                  })),
                  profiles: filtered,
                  progress: progress.filter(
                    (r) =>
                      filtered.some((p) => p.id === r.profileId) &&
                      catalog.some((u) => u.id === r.unitId),
                  ),
                  summary: data,
                },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          ↓ Exportar JSON
        </button>
        <button
          disabled={
            !unitId ||
            !filtered.some((p) => catalog.some((u) => u.grade === p.grade))
          }
          onClick={async () => {
            try {
              const unit = catalog[0];
              for (const p of filtered.filter((p) => p.grade === unit.grade))
                await putProfile({
                  ...p,
                  assignedUnits: [
                    ...new Set([...(p.assignedUnits ?? []), unit.id]),
                  ],
                });
              await refresh();
            } catch {
              setError("No se completó la asignación. Revisa los perfiles.");
            }
          }}
        >
          📌 Asignar unidad seleccionada
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="teacher-grid">
        {filtered.map((p) => {
          const report = data.filter((r) => r.perfilId === p.id);
          return (
            <article key={p.id} className="panel">
              <h3>
                {p.avatar} {p.alias} · {gradeLabel(p.grade)}
              </h3>
              {catalog
                .filter((u) => u.grade === p.grade)
                .map((u) => {
                  const r = progress.find(
                    (r) => r.profileId === p.id && r.unitId === u.id,
                  );
                  return (
                    <div key={u.id}>
                      <strong>
                        {u.subject} · {u.title}
                      </strong>
                      <p>
                        {r?.completed.length ?? 0} / {u.steps.length} pantallas
                        · {r?.finished ? "Terminó" : "En proceso"}
                      </p>
                    </div>
                  );
                })}
              <label>
                Grupo
                <input
                  defaultValue={p.group}
                  maxLength={40}
                  onBlur={(e) => {
                    if (e.target.value.trim())
                      void change(p, { group: e.target.value.trim() });
                  }}
                />
              </label>
              <label>
                Apoyo de acceso
                <select
                  value={p.support}
                  onChange={(e) =>
                    void change(p, {
                      support: e.target.value as Profile["support"],
                    })
                  }
                >
                  <option value="visual">Manipulativo y visual</option>
                  <option value="guiado">Guiado con pistas</option>
                  <option value="autonomo">
                    Autónomo con ayudas disponibles
                  </option>
                </select>
              </label>
              <p className="fine">
                El apoyo cambia el acceso, conserva el objetivo. Cualquier
                ajuste del objetivo requiere documentar una decisión pedagógica.
              </p>
              <ul className="results">
                {report.map((r) => (
                  <li key={r.unidad + "-" + r.objetivo}>
                    <strong>
                      {r.asignatura} · {r.objetivo.replaceAll("_", " ")}
                    </strong>
                    <span>
                      Primer intento: {r.primerIntento} · {r.intentos} intentos
                      · {r.ayudas} ayudas
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                Producciones físicas: confirmación del estudiante, no
                verificación automática.
              </p>
              {remove === p.id ? (
                <div role="group" aria-label="Confirmar borrado">
                  <p>
                    Se eliminarán el perfil y todos sus avances en este equipo.
                    Exporta primero.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await deleteProfile(p.id);
                        await refresh();
                        setRemove("");
                      } catch {
                        setError("No se pudo borrar el perfil.");
                      }
                    }}
                  >
                    Confirmar eliminación
                  </button>
                  <button onClick={() => setRemove("")}>Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setRemove(p.id)}>
                  Eliminar datos de este perfil
                </button>
              )}
            </article>
          );
        })}
      </div>
      {!profiles.length && (
        <p>Aún no hay perfiles. Crea un alias desde Estudiantes.</p>
      )}
      <details>
        <summary>Guía de observación y fuentes</summary>
        {catalog.map((u) => (
          <div key={u.id}>
            <h3>
              {gradeLabel(u.grade)} · {u.subject} · {u.title}
            </h3>
            <p>{u.curriculum.competence}</p>
            <ul>
              {u.curriculum.evidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p>
              Fuente: {u.source.file}. Localizador: {u.source.locator}. Estado:{" "}
              {u.source.status}.
            </p>
          </div>
        ))}
        <p>
          Observa también las explicaciones orales, dibujos y correcciones. No
          interpretes lentitud de escritura como ausencia de comprensión.
        </p>
      </details>
    </section>
  );
}
