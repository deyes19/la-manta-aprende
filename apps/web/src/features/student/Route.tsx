import { useState } from "react";
import type { Profile, Progress } from "../../offline/store";
import { units, gradeLabel, type Unit } from "../../data/content";
import { Audio } from "../../components/Audio";
import { Preschool } from "../preschool/Preschool";
export function Route({
  profile,
  progress,
  onStart,
  onChange,
}: {
  profile: Profile;
  progress: Progress[];
  onStart: (unit: Unit) => void;
  onChange: () => void;
}) {
  const [period, setPeriod] = useState(4);
  const [subject, setSubject] = useState("Matemáticas");
  const available = units.filter(
    (u) =>
      u.grade === profile.grade && u.period === period && u.subject === subject,
  );
  return (
    <section>
      <button onClick={onChange}>← Cambiar de estudiante</button>
      <div className="route-heading">
        <div>
          <p className="eyebrow">Mi ruta · {gradeLabel(profile.grade)}</p>
          <h2>
            {profile.avatar} Hola, {profile.alias}
          </h2>
          <p>Aprende a tu ritmo. Podemos parar y retomar.</p>
        </div>
        <Audio id="ruta" />
      </div>
      <div className="filters">
        <label>
          Período
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((p) => (
              <option key={p} value={p}>
                Período {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Asignatura o proyecto
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {[
              "Matemáticas",
              "Lengua Castellana",
              "Ciencias Sociales",
              "Ciencias Naturales",
              "CapER",
              "EATI",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {available.map((unit) => {
        const record = progress.find((p) => p.unitId === unit.id);
        return (
          <article className="unit-card" key={unit.id}>
            <div className="unit-art" aria-hidden="true">
              {unit.subject === "Matemáticas"
                ? "🧺"
                : unit.subject === "Lengua Castellana"
                  ? "📖"
                  : "🏡"}
              <span>
                {unit.subject === "Matemáticas" ? "🥭 🥭 🥭" : "🌱 ☀ 🌻"}
              </span>
            </div>
            <div>
              <p className="eyebrow">
                {gradeLabel(unit.grade)} · {unit.subject} · Período{" "}
                {unit.period}
              </p>
              <h3>{unit.title}</h3>
              <p>{unit.curriculum.competence}</p>
              <p className="badge">
                {unit.source.status === "PENDIENTE_FUENTE"
                  ? "Disponible como piloto · fuente pendiente"
                  : unit.source.status === "FUENTE_CONSULTADA"
                    ? "Fuente consultada · revisión pedagógica pendiente"
                    : "Fuente validada"}
              </p>
              <p>
                {new Set(unit.steps.map((s) => s.phase)).size} momentos ·{" "}
                {unit.steps.length} pantallas · con audio local
              </p>
              {(profile.assignedUnits?.includes(unit.id) ||
                (profile.assigned &&
                  unit.id === "g2-matematicas-p4-multiplicacion")) && (
                <p>📌 Tu docente te asignó esta misión.</p>
              )}
              {record && (
                <p>
                  {record.completed.length} pantallas completadas
                  {record.finished ? " · recorrido terminado" : ""}
                </p>
              )}
              <button className="primary" onClick={() => onStart(unit)}>
                {record?.finished
                  ? "Volver a revisar →"
                  : record?.completed.length
                    ? "Reanudar →"
                    : "Abrir unidad →"}
              </button>
            </div>
          </article>
        );
      })}
      {!available.length &&
        (profile.grade === 0 ? (
          <Preschool />
        ) : (
          <div className="panel">
            <h3>Aún no hay una unidad aquí</h3>
            <p>
              Estamos preparando Matemáticas, Lengua Castellana y Ciencias
              Sociales, desde transición a quinto, para el cuarto período. Solo
              las unidades terminadas aparecen como disponibles.
            </p>
            <p>
              La cobertura curricular de esta selección necesita la lectura de
              su malla original. No hay actividades aprobadas que podamos
              atribuirle todavía.
            </p>
            {["CapER", "EATI"].includes(subject) && (
              <p>
                Conservaremos la organización integrada de {subject}; no se han
                creado temas institucionales sin malla.
              </p>
            )}
          </div>
        ))}
    </section>
  );
}
