import { audioFile } from "../data/audio";
import { useEffect, useRef, useState } from "react";
export function Audio({ id, auto = false }: { id: string; auto?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const play = () => {
    setError("");
    const a = ref.current;
    if (a) {
      a.currentTime = 0;
      a.playbackRate = rate;
      a.play()
        .then(() => setPlaying(true))
        .catch(() =>
          setError(
            "Pulsa Escuchar. Revisa el volumen; también puedes seguir las imágenes y el texto.",
          ),
        );
    }
  };
  useEffect(() => {
    setError("");
    setPlaying(false);
    if (auto) play();
    return () => ref.current?.pause();
  }, [id]);
  return (
    <div className="audio-controls">
      <audio
        ref={ref}
        src={audioFile(id)}
        onEnded={() => setPlaying(false)}
        onError={() =>
          setError(
            "No se pudo abrir el audio local. Revisa la preparación sin conexión.",
          )
        }
        preload="auto"
      />
      <button onClick={play}>🔊 Escuchar instrucciones</button>
      <button onClick={play}>↻ Repetir</button>
      {playing && (
        <button
          onClick={() => {
            ref.current?.pause();
            setPlaying(false);
          }}
        >
          ⏸ Pausar
        </button>
      )}
      <label className="compact">
        Velocidad
        <select
          value={rate}
          onChange={(e) => {
            setRate(Number(e.target.value));
            if (ref.current) ref.current.playbackRate = Number(e.target.value);
          }}
        >
          <option value={1}>Normal</option>
          <option value={0.8}>Más lenta</option>
        </select>
      </label>
      {error && <p role="status">{error}</p>}
    </div>
  );
}
export function playFeedback(id: string) {
  const a = new window.Audio(audioFile(id));
  a.play().catch(() => {});
  return () => a.pause();
}
