export function ObjectDrawing({ symbol }: { symbol: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="counting-object"
      aria-hidden="true"
      fill="#f7d48c"
      stroke="#174b39"
      strokeWidth="2.5"
    >
      {symbol === "🐔" ? (
        <>
          <ellipse cx="23" cy="27" rx="14" ry="12" fill="#fff6df" />
          <circle cx="32" cy="14" r="7" />
          <path d="M38 13L46 16L38 18 M16 37V44 M28 38V44" />
          <circle cx="34" cy="12" r="1" fill="#174b39" />
        </>
      ) : symbol === "🌱" ? (
        <>
          <path d="M24 43V18" />
          <path
            fill="#cfe5bb"
            d="M24 28C6 30 5 14 8 10C20 10 24 19 24 28Z M24 22C40 23 45 9 40 6C27 7 24 15 24 22Z"
          />
        </>
      ) : symbol === "🥭" ? (
        <>
          <path d="M25 8C4 11 5 37 22 42C42 45 45 16 30 9Z" />
          <path fill="#cfe5bb" d="M26 9L39 2L35 11Z" />
        </>
      ) : (
        <>
          <ellipse cx="24" cy="25" rx="13" ry="18" />
          <path d="M24 9C17 23 18 32 25 42" />
        </>
      )}
    </svg>
  );
}
export function DrawingModel({
  kind,
}: {
  kind: "semillas" | "personajes" | "comunidad";
}) {
  const titles = {
    semillas: "Una planta que puedes dibujar",
    personajes: "Personajes para tu dibujo",
    comunidad: "Casas de una comunidad para dibujar",
  };
  return (
    <figure className="drawing-model">
      <svg
        viewBox="0 0 320 180"
        role="img"
        aria-label={titles[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {kind === "semillas" ? (
          <>
            <path d="M30 150H290 M160 148V70" />
            <path
              fill="#cfe5bb"
              d="M159 108C107 109 91 76 99 61C136 64 157 80 159 108Z M161 97C213 99 231 65 223 50C185 54 164 70 161 97Z"
            />
            <ellipse fill="#f1d092" cx="160" cy="158" rx="14" ry="9" />
          </>
        ) : kind === "personajes" ? (
          <>
            {[75, 235].map((x) => (
              <g key={x}>
                <circle fill="#ffdfb6" cx={x} cy="82" r="21" />
                <path
                  d={`M${x} 105V141 M${x - 24} 126L${x} 110L${x + 24} 126 M${x - 20} 164L${x} 141L${x + 20} 164`}
                />
              </g>
            ))}
            <path fill="#fff" d="M115 20H205V60H175L160 72V60H115Z" />
            <path d="M131 36H189 M131 48H170" />
          </>
        ) : (
          <>
            {[25, 125, 225].map((x) => (
              <g key={x}>
                <path
                  fill="#ffe7b1"
                  d={`M${x} 90L${x + 35} 55L${x + 70} 90V153H${x}Z`}
                />
                <path
                  d={`M${x + 25} 153V117H${x + 45}V153 M${x + 10} 98H${x + 22}V110H${x + 10}Z`}
                />
              </g>
            ))}
            <path d="M15 164H310" />
          </>
        )}
      </svg>
      <figcaption>
        {titles[kind]}. Usa líneas, círculos y figuras sencillas; sigue las
        cantidades del ejercicio.
      </figcaption>
    </figure>
  );
}
