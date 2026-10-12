import { Play } from "../preschool/Play";
import { useEffect, useRef, useState } from "react";
import { gradeLabel, type Unit } from "../../data/content";
import { Audio, playFeedback } from "../../components/Audio";
import { Visual } from "./Visual";
import { Activity, Groups } from "./Activity";
import { saveProgress, type Progress, type Profile } from "../../offline/store";
const primaryPhases = [
  "Hoy aprenderé",
  "Descubro",
  "Aprendo",
  "Mi cuaderno",
  "Practico",
  "Mi misión",
  "Demuestro lo aprendido",
  "Terminé",
];
export function Player({
  profile,
  unit,
  initial,
  onExit,
}: {
  profile: Profile;
  unit: Unit;
  initial: Progress;
  onExit: () => void;
}) {
  const [p, setP] = useState(initial);
  const [selfReport, setSelfReport] = useState(initial.selfReport ?? "");
  const [hint, setHint] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const stop = useRef<() => void>(() => {});
  const phases =
    unit.approach === "preschool"
      ? [...new Set(unit.steps.map((s) => s.phase))]
      : primaryPhases;
  const s = unit.steps[p.index];
  const done = !!p.attempts[s.id]?.some((a) => a.correct);
  const current = phases.indexOf(s.phase);
  useEffect(() => {
    setHint(false);
    setError("");
    heading.current?.focus();
    stop.current();
    return () => stop.current();
  }, [s.id]);
  async function commit(next: Progress) {
    setSaving(true);
    setError("");
    try {
      const updated = { ...next, updatedAt: new Date().toISOString() };
      await saveProgress(updated);
      setP(updated);
      return true;
    } catch {
      setError(
        "No pudimos guardar. No cierres esta ventana. Revisa el espacio del equipo y pulsa el botón otra vez.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="lesson">
      <div className="lesson-top">
        <button onClick={onExit}>⌂ Volver a mi ruta</button>
        <span>
          {profile.avatar} {profile.alias} · {gradeLabel(profile.grade)} ·{" "}
          {unit.subject}
        </span>
        <span>
          {p.index + 1} / {unit.steps.length}
        </span>
      </div>
      <progress
        value={p.completed.length}
        max={unit.steps.length}
        aria-label="Pantallas completadas"
      />
      <ol className="phase-list">
        {phases.map((phase, i) => (
          <li
            key={phase}
            aria-current={i === current ? "step" : undefined}
            className={i === current ? "active" : ""}
          >
            <span>{i + 1}</span>
            {phase}
          </li>
        ))}
      </ol>
      <article className="step-card">
        <p className="eyebrow">{s.phase}</p>
        <h2 ref={heading} tabIndex={-1}>
          {s.title}
        </h2>
        <p className="instruction">{s.instruction}</p>
        <Audio id={s.id} auto />
        {s.visual && s.activity?.kind !== "fraction" && (
          <Visual key={s.id + "-visual"} visual={s.visual} />
        )}
        {s.freePlay && (
          <Play
            symbols={s.freePlay.symbols}
            value={p.products?.[s.id] ?? []}
            disabled={saving}
            onChange={(value) =>
              void commit({ ...p, products: { ...p.products, [s.id]: value } })
            }
          />
        )}
        {s.symbol && (
          <div className="lesson-symbol" aria-hidden="true">
            {s.symbol}
          </div>
        )}
        <div className={s.phase === "Mi cuaderno" ? "notebook" : "reading"}>
          {(s.showDate || s.id === "cuaderno-titulo") && (
            <p>
              Fecha:{" "}
              {new Intl.DateTimeFormat("es-CO", {
                timeZone: "America/Bogota",
              }).format(new Date())}
            </p>
          )}
          {s.text.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
        {s.groups && s.activity?.kind !== "groups" && (
          <Groups
            key={`groups-${s.id}`}
            groups={s.groups}
            adjustable={s.adjustableGroups ?? s.id.startsWith("tabla-")}
          />
        )}
        <button
          className="hint-button"
          disabled={saving}
          onClick={async () => {
            const next = {
              ...p,
              hints: { ...p.hints, [s.id]: (p.hints[s.id] ?? 0) + 1 },
            };
            if (await commit(next)) {
              setHint(true);
              stop.current();
              stop.current = playFeedback(s.id + "-hint");
            }
          }}
        >
          💡 Necesito una pista
        </button>
        {hint && (
          <p role="status" className="hint">
            {s.hint}
          </p>
        )}
        {profile.support === "guiado" && (
          <p className="support-note">
            👣{" "}
            {unit.approach === "preschool"
              ? "Primero escucha. Después juega, observa o crea. Puedes comunicarte con palabras o gestos y pedir acompañamiento."
              : "Primero escucha. Después realiza la acción. Comprueba tu respuesta; si lo necesitas, pide una pista y vuelve a intentar."}
          </p>
        )}
        {profile.support === "visual" && (
          <p className="support-note">
            👐 Observa los dibujos y usa objetos o tarjetas cuando la consigna
            lo indique. Haz una acción a la vez.
          </p>
        )}
        {s.activity && (
          <Activity
            key={`activity-${s.id}`}
            step={s}
            done={done}
            onAttempt={async (value, correct) => {
              const entry = {
                value,
                correct,
                at: new Date().toISOString(),
                hints: p.hints[s.id] ?? 0,
              };
              if (
                await commit({
                  ...p,
                  attempts: {
                    ...p.attempts,
                    [s.id]: [...(p.attempts[s.id] ?? []), entry],
                  },
                })
              ) {
                stop.current();
                stop.current = playFeedback(
                  s.id + (correct ? "-success" : "-retry"),
                );
                return true;
              }
              return false;
            }}
          />
        )}
        {s.phase === "Mi cuaderno" && (
          <p className="fine">
            Al continuar declaras que terminaste. La revisión del cuaderno la
            hace tu docente.
          </p>
        )}
        {s.phase === "Terminé" && (
          <fieldset>
            <legend>¿Cómo te sentiste?</legend>
            {[
              "Lo hice con confianza",
              "Necesité una pista",
              "Quiero practicar de nuevo",
            ].map((v, i) => (
              <label className="option" key={v}>
                <input
                  type="radio"
                  name="self-report"
                  checked={selfReport === v}
                  onChange={() => setSelfReport(v)}
                />
                {["😊", "🤝", "🌱"][i]} {v}
              </label>
            ))}
            <Audio id="autoevaluacion" />
            {p.finished && (
              <p role="status" className="success">
                Tu trabajo quedó guardado. ¡Comparte lo que hiciste con el
                docente!
              </p>
            )}
          </fieldset>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="step-nav">
          <button
            disabled={p.index === 0 || saving}
            onClick={() => void commit({ ...p, index: p.index - 1 })}
          >
            ← Atrás
          </button>
          <button
            className="primary"
            disabled={
              saving ||
              (!!s.activity && !done) ||
              (s.phase === "Terminé" && !selfReport)
            }
            onClick={async () => {
              const last = p.index === unit.steps.length - 1;
              if (
                await commit({
                  ...p,
                  completed: [...new Set([...p.completed, s.id])],
                  index: last ? p.index : p.index + 1,
                  finished: last || p.finished,
                  ...(last ? { selfReport } : {}),
                })
              ) {
                if (last) {
                  stop.current();
                  stop.current = playFeedback("guardado");
                }
              }
            }}
          >
            {saving
              ? "Guardando…"
              : s.phase === "Terminé"
                ? "✓ Guardar y terminar"
                : s.phase === "Mi cuaderno"
                  ? "✓ Ya terminé · Continuar"
                  : "Continuar →"}
          </button>
        </div>
        {s.activity && !done && (
          <p className="fine">
            Comprueba el reto para continuar. Puedes intentarlo de nuevo y pedir
            una pista.
          </p>
        )}
      </article>
    </section>
  );
}
