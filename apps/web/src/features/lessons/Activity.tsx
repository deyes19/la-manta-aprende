import { Fraction } from "./Visual";
import { ObjectDrawing } from "./DrawingModel";
import { useState } from "react";
import type { Step } from "../../data/content";
const normalize = (value: string | number) =>
  String(value)
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");
export function isCorrect(
  step: Step,
  value: string | number,
  counts: number[],
) {
  const a = step.activity!;
  if (a.kind === "groups")
    return (
      counts.length === step.groups![0] &&
      counts.every((n) => n === step.groups![1])
    );
  if (a.kind === "fraction")
    return (
      counts.length === a.answer &&
      new Set(counts).size === counts.length &&
      step.visual?.kind === "fraction" &&
      counts.every(
        (n) =>
          Number.isInteger(n) &&
          n >= 0 &&
          n < (step.visual as { parts: number }).parts,
      )
    );
  if (a.kind === "decimal")
    return (
      /^\d+(?:[.,]\d+)?$/.test(String(value).trim()) &&
      Math.abs(
        Number(String(value).trim().replace(",", ".")) - Number(a.answer),
      ) < 1e-9
    );
  if (a.kind === "number")
    return String(value).trim() !== "" && Number(value) === a.answer;
  if (a.kind === "text")
    return [String(a.answer), ...(a.acceptedAnswers ?? [])].some(
      (answer) => normalize(value) === normalize(answer),
    );
  return value === a.answer;
}
export function Groups({
  groups,
  interactive = false,
  adjustable = false,
  counts,
  onChange,
}: {
  groups: [number, number, string];
  interactive?: boolean;
  adjustable?: boolean;
  counts?: number[];
  onChange?: (c: number[]) => void;
}) {
  const [open, setOpen] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(groups[0]);
  return (
    <div>
      <div className="groups" aria-label="Representación de grupos iguales">
        {Array.from({ length: interactive ? groups[0] : quantity }, (_, i) => {
          const n = interactive ? counts![i] : groups[1];
          const shown = interactive || open.includes(i);
          return (
            <div key={i} className="basket-unit">
              <button
                className="basket"
                disabled={interactive && n >= 10}
                aria-label={`Grupo ${i + 1}: ${interactive ? n : shown ? n : "sin abrir"} elementos`}
                onClick={() =>
                  interactive
                    ? onChange!(
                        counts!.map((v, j) =>
                          j === i ? Math.min(10, v + 1) : v,
                        ),
                      )
                    : setOpen(
                        open.includes(i)
                          ? open.filter((v) => v !== i)
                          : [...open, i],
                      )
                }
              >
                <span className="basket-name">
                  {interactive ? "＋" : "🧺"} Grupo {i + 1}
                </span>
                <span className="objects" aria-hidden="true">
                  {shown
                    ? n
                      ? Array.from({ length: n }, (_, j) => (
                          <ObjectDrawing key={j} symbol={groups[2]} />
                        ))
                      : "Vacío"
                    : "Toca para abrir"}
                </span>
              </button>
              {interactive && (
                <button
                  className="remove-object"
                  aria-label={`Quitar un objeto del grupo ${i + 1}`}
                  disabled={!n}
                  onClick={() =>
                    onChange!(counts!.map((v, j) => (j === i ? v - 1 : v)))
                  }
                >
                  − Quitar un objeto
                </button>
              )}
            </div>
          );
        })}
      </div>
      {interactive && (
        <p className="group-total" aria-live="polite">
          Has colocado {counts!.reduce((total, n) => total + n, 0)} objetos en{" "}
          {groups[0]} grupos.
        </p>
      )}
      {!interactive && adjustable && (
        <div className="group-tools">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1}
            aria-label="Quitar un grupo"
          >
            −
          </button>
          <strong>
            {quantity} grupos de {groups[1]}
          </strong>
          <button
            onClick={() => setQuantity(Math.min(10, quantity + 1))}
            disabled={quantity === 10}
            aria-label="Agregar un grupo"
          >
            ＋
          </button>
          <p>
            {Array(quantity).fill(groups[1]).join(" + ")} ={" "}
            {quantity * groups[1]}
          </p>
        </div>
      )}
    </div>
  );
}
export function Activity({
  step,
  onAttempt,
  done,
}: {
  step: Step;
  onAttempt: (value: string | number, correct: boolean) => Promise<boolean>;
  done: boolean;
}) {
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [ordered, setOrdered] = useState(step.activity!.choices ?? []);
  const [value, setValue] = useState<string>("");
  const [counts, setCounts] = useState(
    Array(step.groups?.[0] ?? 0).fill(0) as number[],
  );
  const [feedback, setFeedback] = useState<"ok" | "retry" | null>(null);
  const [busy, setBusy] = useState(false);
  const a = step.activity!;
  return (
    <div className="activity">
      <h3>{a.prompt}</h3>
      {a.kind === "fraction" && step.visual?.kind === "fraction" ? (
        <Fraction
          parts={step.visual.parts}
          selected={selectedParts}
          onChange={(parts) => {
            setSelectedParts(parts);
            setFeedback(null);
          }}
        />
      ) : a.kind === "groups" ? (
        <Groups
          groups={step.groups!}
          interactive
          counts={counts}
          onChange={(c) => {
            setCounts(c);
            setFeedback(null);
          }}
        />
      ) : a.kind === "choice" ? (
        <fieldset>
          <legend>Elige una respuesta</legend>
          {a.choices!.map((c) => (
            <label className="option" key={c}>
              <input
                type="radio"
                name={step.id}
                checked={value === c}
                onChange={() => {
                  setValue(c);
                  setFeedback(null);
                }}
              />
              {c}
            </label>
          ))}
        </fieldset>
      ) : a.kind === "order" ? (
        <ol className="order-activity">
          {ordered.map((item, i) => (
            <li key={item}>
              <span>{item}</span>
              <button
                aria-label={`Subir ${item}`}
                disabled={i === 0}
                onClick={() => {
                  const next = [...ordered];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  setOrdered(next);
                  setFeedback(null);
                }}
              >
                ↑
              </button>
              <button
                aria-label={`Bajar ${item}`}
                disabled={i === ordered.length - 1}
                onClick={() => {
                  const next = [...ordered];
                  [next[i], next[i + 1]] = [next[i + 1], next[i]];
                  setOrdered(next);
                  setFeedback(null);
                }}
              >
                ↓
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <label>
          Tu respuesta
          <input
            type={["text", "decimal"].includes(a.kind) ? "text" : "number"}
            inputMode={
              a.kind === "text"
                ? "text"
                : a.kind === "decimal"
                  ? "decimal"
                  : "numeric"
            }
            min="0"
            step="1"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setFeedback(null);
            }}
          />
        </label>
      )}
      <button
        className="primary"
        disabled={
          busy || (!["groups", "order", "fraction"].includes(a.kind) && !value)
        }
        onClick={async () => {
          const response = a.kind === "order" ? ordered.join("|") : value;
          const correct = isCorrect(
            step,
            response,
            a.kind === "fraction" ? selectedParts : counts,
          );
          setBusy(true);
          try {
            if (
              await onAttempt(
                a.kind === "groups"
                  ? counts.join(",")
                  : a.kind === "fraction"
                    ? selectedParts.join(",")
                    : response,
                correct,
              )
            )
              setFeedback(correct ? "ok" : "retry");
          } finally {
            setBusy(false);
          }
        }}
      >
        ✓ Comprobar
      </button>
      {feedback && (
        <p className={feedback === "ok" ? "success" : "feedback"} role="status">
          {feedback === "ok"
            ? "¡Lo lograste! " + a.explanation
            : "Todavía no. " + step.hint + " Corrige y comprueba otra vez."}
        </p>
      )}
      {done && !feedback && (
        <p className="success">
          Ya resolviste este reto. Puedes repetirlo o continuar.
        </p>
      )}
    </div>
  );
}
