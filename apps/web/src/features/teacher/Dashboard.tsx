import { useState } from "react";
import { pilot } from "../../data/content";
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
  const [error, setError] = useState("");
  const [remove, setRemove] = useState("");
  const filtered = profiles.filter(
    (p) => (!group || p.group === group) && (!student || p.id === student),
  );
  const data = rows(filtered, progress);
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
        Los resultados describen esta práctica; no son notas oficiales. El
        cuaderno y las producciones requieren observación docente.
      </p>
      <div className="warning">
        <strong>Revisión curricular pendiente</strong>
        <p>
          El kit propone este tema para segundo, período IV. Falta consultar la
          malla original, validar competencias, evidencias, duración y voz. No
          se han auditado los 315 registros mencionados en el kit.
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
      </div>
      <div className="toolbar">
        <button
          disabled={!filtered.length}
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
                  schemaVersion: 1,
                  exportedAt: new Date().toISOString(),
                  unit: {
                    id: pilot.id,
                    version: pilot.version,
                    source: pilot.source,
                  },
                  profiles: filtered,
                  progress: progress.filter((r) =>
                    filtered.some((p) => p.id === r.profileId),
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
          disabled={!filtered.some((p) => p.grade === 2)}
          onClick={async () => {
            try {
              for (const p of filtered.filter((p) => p.grade === 2))
                await putProfile({ ...p, assigned: true });
              await refresh();
            } catch {
              setError("No se completó la asignación. Revisa los perfiles.");
            }
          }}
        >
          📌 Asignar piloto a segundo
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="teacher-grid">
        {filtered.map((p) => {
          const r = progress.find((r) => r.profileId === p.id);
          const report = data.filter((d) => d.perfilId === p.id);
          return (
            <article className="panel" key={p.id}>
              <h3>
                {p.avatar} {p.alias} ·{" "}
                {p.grade === 0 ? "Transición" : `Grado ${p.grade}`}
              </h3>
              <p>
                {r?.completed.length ?? 0} / {pilot.steps.length} pantallas ·{" "}
                {r?.finished ? "Terminó" : "En proceso"}
              </p>
              <label>
                Grupo
                <input
                  defaultValue={p.group}
                  key={p.id + "-group"}
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
                El apoyo cambia el acceso, conserva el objetivo. Si se requiere
                ajustar el objetivo, documentarlo en una próxima revisión
                pedagógica.
              </p>
              <ul className="results">
                {report.map((d) => (
                  <li key={d.objetivo}>
                    <strong>{d.objetivo.replaceAll("_", " ")}</strong>
                    <span>
                      Primer intento: {d.primerIntento} · {d.intentos} intentos
                      · {d.ayudas} ayudas
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                Cuaderno: declaración del estudiante; no verificado
                automáticamente.
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
        <p>{pilot.curriculum.competence}</p>
        <ul>
          {pilot.curriculum.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <p>
          Fuente disponible: {pilot.source.file}. Estado: {pilot.source.status}.
          Guía completa en docs/MANUAL_DOCENTE.md.
        </p>
        <p>
          Revisa: grupos con igual cantidad, correspondencia
          dibujo-suma-multiplicación, correcciones y explicación oral. No
          interpretes lentitud de escritura como ausencia de comprensión.
        </p>
      </details>
    </section>
  );
}
