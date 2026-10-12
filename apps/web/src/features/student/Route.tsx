import { useState } from "react";
import type { Profile, Progress } from "../../offline/store";
import { pilot } from "../../data/content";
import { Audio } from "../../components/Audio";
import { Preschool } from "../preschool/Preschool";
export function Route({
  profile,
  progress,
  onStart,
  onChange,
}: {
  profile: Profile;
  progress?: Progress;
  onStart: () => void;
  onChange: () => void;
}) {
  const [period, setPeriod] = useState(4);
  const [subject, setSubject] = useState("Matemáticas");
  const available =
    profile.grade === 2 && period === 4 && subject === "Matemáticas";
  return (
    <section>
      <button onClick={onChange}>← Cambiar de estudiante</button>
      <div className="route-heading">
        <div>
          <p className="eyebrow">
            Mi ruta ·{" "}
            {profile.grade === 0 ? "Transición" : `Grado ${profile.grade}`}
          </p>
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
              "Ciencias Naturales",
              "Ciencias Sociales",
              "CapER",
              "EATI",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {available ? (
        <article className="unit-card">
          <div className="unit-art" aria-hidden="true">
            🧺<span>🥭 🥭 🥭</span>
            <span className="sun">☀</span>
          </div>
          <div>
            <p className="eyebrow">Segundo · Matemáticas · Período 4</p>
            <h3>{pilot.title}</h3>
            <p>
              Canastas, gallinas y semillas. Descubre los grupos iguales y las
              tablas del 2 al 5.
            </p>
            <p className="badge">
              Piloto disponible · fuente institucional pendiente
            </p>
            <p>8 momentos · {pilot.steps.length} pantallas · con audio local</p>
            {profile.assigned && <p>📌 Tu docente te asignó esta misión.</p>}
            {progress && (
              <p>
                {progress.completed.length} pantallas completadas
                {progress.finished ? " · recorrido terminado" : ""}
              </p>
            )}
            <button className="primary" onClick={onStart}>
              {progress?.finished
                ? "Volver a revisar →"
                : progress?.completed.length
                  ? "Reanudar →"
                  : "Abrir unidad →"}
            </button>
          </div>
        </article>
      ) : profile.grade === 0 ? (
        <Preschool />
      ) : (
        <div className="panel">
          <h3>Aún no hay una unidad aquí</h3>
          <p>
            Esta entrega contiene únicamente el piloto de segundo, Matemáticas,
            período cuarto. Los demás contenidos requieren las fuentes
            originales y revisión pedagógica.
          </p>
          {["CapER", "EATI"].includes(subject) && (
            <p>
              Conservaremos la organización integrada de {subject}; no se han
              creado temas institucionales sin malla.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
