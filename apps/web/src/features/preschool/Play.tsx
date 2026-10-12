import { useState } from "react";
export function Play({
  symbols,
  value,
  onChange,
  disabled,
}: {
  symbols: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const cells = Array.from({ length: 20 }, (_, i) => value[i] ?? "");
  const count = cells.filter(Boolean).length;
  function add(symbol: string) {
    const i = cells.indexOf("");
    if (i === -1) return;
    const next = [...cells];
    next[i] = symbol;
    setSelected(i);
    onChange(next);
  }
  function choose(i: number) {
    if (cells[i]) {
      setSelected(i);
      return;
    }
    if (selected === null || !cells[selected]) return;
    const next = [...cells];
    next[i] = next[selected];
    next[selected] = "";
    setSelected(i);
    onChange(next);
  }
  return (
    <div className="free-play">
      <p>
        Toca un dibujo para añadirlo. Toca una figura de tu composición para
        seleccionarla; después toca una casilla vacía para moverla.
      </p>
      <div role="group" aria-label="Figuras para explorar">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            disabled={disabled || count === 20}
            aria-label={`Agregar ${symbol}`}
            onClick={() => add(symbol)}
          >
            {symbol}
          </button>
        ))}
      </div>
      <div
        className="composition spatial-composition"
        role="group"
        aria-label={`Composición con ${count} figuras`}
      >
        {cells.map((symbol, i) => (
          <button
            key={i}
            disabled={disabled || (!symbol && selected === null)}
            aria-label={`Fila ${Math.floor(i / 4) + 1}, columna ${(i % 4) + 1}: ${symbol || "vacía"}`}
            aria-pressed={selected === i}
            onClick={() => choose(i)}
          >
            {symbol || "·"}
          </button>
        ))}
      </div>
      <button
        disabled={disabled || !count}
        onClick={() => {
          const i = cells.map(Boolean).lastIndexOf(true);
          const next = [...cells];
          next[i] = "";
          setSelected(null);
          onChange(next);
        }}
      >
        ↶ Quitar la última figura
      </button>
      <p className="fine">
        Puedes hacerlo también con papel u objetos seguros. El programa guarda
        la exploración y sus posiciones; no califica tu creación.
      </p>
    </div>
  );
}
