import { useState } from "react";
import type { Step } from "../../data/content";
export function Fraction({
  parts,
  selected,
  onChange,
}: {
  parts: number;
  selected: number[];
  onChange: (parts: number[]) => void;
}) {
  return (
    <div>
      <div
        className="fraction-grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(parts, 6)},1fr)` }}
        role="group"
        aria-label={`Un entero dividido en ${parts} partes iguales`}
      >
        {Array.from({ length: parts }, (_, i) => (
          <button
            key={i}
            aria-label={`Parte ${i + 1}`}
            aria-pressed={selected.includes(i)}
            onClick={() =>
              onChange(
                selected.includes(i)
                  ? selected.filter((n) => n !== i)
                  : [...selected, i],
              )
            }
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p aria-live="polite">
        {selected.length} de {parts} partes: {selected.length}/{parts}
      </p>
    </div>
  );
}
function Shape({ name }: { name: string }) {
  const draw: Record<string, React.ReactNode> = {
    cubo: (
      <>
        <path d="M35 45L80 20L130 45L80 70Z M35 45V105L80 135L130 105V45 M80 70V135" />
      </>
    ),
    prisma: (
      <>
        <path d="M25 45L100 20L140 45L65 70Z M25 45V105L65 135L140 105V45 M65 70V135" />
      </>
    ),
    pirámide: (
      <>
        <path d="M80 20L25 110L80 140L135 110Z M80 20V140 M25 110L135 110" />
      </>
    ),
    cono: (
      <>
        <path d="M80 20L30 115 M80 20L130 115" />
        <ellipse cx="80" cy="115" rx="50" ry="18" />
      </>
    ),
    cilindro: (
      <>
        <ellipse cx="80" cy="35" rx="48" ry="17" />
        <path d="M32 35V115 M128 35V115" />
        <ellipse cx="80" cy="115" rx="48" ry="17" />
      </>
    ),
    esfera: (
      <>
        <circle cx="80" cy="80" r="55" />
        <ellipse cx="80" cy="80" rx="55" ry="16" strokeDasharray="5 5" />
        <ellipse cx="80" cy="80" rx="18" ry="55" />
      </>
    ),
  };
  return (
    <figure>
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={`Representación de ${name}`}
        fill="#e8efd9"
        stroke="#174b39"
        strokeWidth="3"
      >
        {draw[name]}
      </svg>
      <figcaption>{name}</figcaption>
    </figure>
  );
}
export function Visual({ visual }: { visual: NonNullable<Step["visual"]> }) {
  const [selected, setSelected] = useState(
    Array.from(
      { length: visual.kind === "fraction" ? visual.selected : 0 },
      (_, i) => i,
    ),
  );
  if (visual.kind === "grid")
    return (
      <div>
        <div
          className="area-grid"
          style={{ gridTemplateColumns: `repeat(${visual.columns},1fr)` }}
          role="img"
          aria-label={`Rectángulo de ${visual.rows} filas por ${visual.columns} columnas; ${visual.rows * visual.columns} cuadrados iguales`}
        >
          {Array.from({ length: visual.rows * visual.columns }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <p>
          {visual.rows} filas de {visual.columns} cuadrados:{" "}
          {visual.rows * visual.columns} cuadrados de área.
        </p>
      </div>
    );
  if (visual.kind === "fraction")
    return (
      <Fraction
        parts={visual.parts}
        selected={selected}
        onChange={setSelected}
      />
    );
  if (visual.kind === "bars")
    return (
      <figure>
        <figcaption>
          Diagrama de barras horizontales. Cada cuadro representa un dato.
        </figcaption>
        <table className="bar-chart">
          <thead>
            <tr>
              <th scope="col">Dato</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Barra</th>
            </tr>
          </thead>
          <tbody>
            {visual.labels.map((label, i) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{visual.values[i]}</td>
                <td>
                  <span aria-hidden="true">{"▰".repeat(visual.values[i])}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    );
  if (visual.kind === "shapes")
    return (
      <div className="shape-grid">
        {visual.names.map((name) => (
          <Shape key={name} name={name} />
        ))}
      </div>
    );
  return (
    <figure className="colombia-flag">
      <svg
        viewBox="0 0 200 120"
        role="img"
        aria-label="Bandera de Colombia: amarillo en la mitad superior, azul y rojo en dos franjas inferiores iguales"
      >
        <path fill="#fcd116" d="M0 0H200V60H0z" />
        <path fill="#003893" d="M0 60H200V90H0z" />
        <path fill="#ce1126" d="M0 90H200V120H0z" />
      </svg>
      <figcaption>Bandera de Colombia</figcaption>
    </figure>
  );
}
