import { audioFile } from "../data/audio";
import { useEffect, useRef, useState } from "react";
import { narrate, preferenceEvent } from "../features/narration/speech";
export function Audio({ id, auto = false }: { id: string; auto?: boolean }) {
  const localAudio = useRef<HTMLAudioElement>(null);
  const stop = useRef<() => void>(() => {});
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const play = () => {
    stop.current = narrate(id, rate, {
      localAudio: localAudio.current ?? undefined,
      onPlaying: setPlaying,
      onMessage: setMessage,
    });
  };
  useEffect(() => {
    setMessage("");
    setPlaying(false);
    if (auto) play();
    const changed = () => {
      stop.current();
      setMessage("");
    };
    window.addEventListener(preferenceEvent, changed);
    return () => {
      stop.current();
      window.removeEventListener(preferenceEvent, changed);
    };
  }, [id]);
  return (
    <div className="audio-controls">
      <audio ref={localAudio} src={audioFile(id)} preload="metadata" />
      <button onClick={play}>🔊 Escuchar instrucciones</button>
      <button onClick={play}>↻ Repetir</button>
      {playing && <button onClick={() => stop.current()}>⏹ Detener</button>}
      <label className="compact">
        Velocidad
        <select
          value={rate}
          onChange={(e) => {
            stop.current();
            setRate(Number(e.target.value));
          }}
        >
          <option value={1}>Normal</option>
          <option value={0.8}>Más lenta</option>
        </select>
      </label>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
export function playFeedback(id: string) {
  return narrate(id);
}
