import { useEffect, useRef, useState } from "react";
import {
  chooseVoice,
  getVoicePreference,
  narrate,
  setVoicePreference,
  spanishVoices,
  type VoicePreference,
} from "./speech";
export function VoiceSettings() {
  const [preference, setPreference] = useState(getVoicePreference);
  const [voices, setVoices] = useState(spanishVoices);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState("");
  const stop = useRef<() => void>(() => {});
  useEffect(() => {
    const changed = () => setVoices(spanishVoices());
    const network = () => setOnline(navigator.onLine);
    window.addEventListener("online", network);
    window.addEventListener("offline", network);
    window.speechSynthesis?.addEventListener("voiceschanged", changed);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", changed);
      window.removeEventListener("online", network);
      window.removeEventListener("offline", network);
      stop.current();
    };
  }, []);
  function save(next: VoicePreference) {
    setPreference(next);
    const stored = setVoicePreference(next);
    setMessage(
      stored
        ? "Voz guardada en este equipo."
        : "La elección se aplicará durante esta sesión. Permite el almacenamiento para conservarla.",
    );
  }
  const selected = chooseVoice(voices, preference.voiceURI, online);
  return (
    <details className="voice-settings">
      <summary>🔊 Elegir voz</summary>
      <div className="voice-options">
        <label>
          Narración
          <select
            value={preference.mode}
            onChange={(e) =>
              save({
                ...preference,
                mode: e.target.value as VoicePreference["mode"],
              })
            }
          >
            <option value="browser">Voz del navegador</option>
            <option value="recorded">Audios guardados</option>
          </select>
        </label>
        {preference.mode === "browser" && (
          <>
            <label>
              Voz en español
              <select
                value={preference.voiceURI}
                onChange={(e) =>
                  save({ ...preference, voiceURI: e.target.value })
                }
              >
                <option value="">
                  Automática · preferir una voz instalada
                </option>
                {preference.voiceURI &&
                  !voices.some((v) => v.voiceURI === preference.voiceURI) && (
                    <option value={preference.voiceURI}>
                      Voz guardada no disponible
                    </option>
                  )}
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} · {v.lang} ·{" "}
                    {v.localService ? "instalada" : "necesita internet"}
                  </option>
                ))}
              </select>
            </label>
            <p>
              {selected
                ? `Voz disponible: ${selected.name} (${selected.lang}).`
                : "No hay una voz en español disponible todavía. Usaremos los audios guardados."}
            </p>
            <p>
              Elige la voz que te guste y escúchala. Para trabajar sin internet,
              elige una voz instalada en este equipo. El acento colombiano
              depende de las voces disponibles.
            </p>
          </>
        )}
        <button
          onClick={() => {
            stop.current = narrate("inicio", 1, { onMessage: setMessage });
          }}
        >
          ▶ Probar voz
        </button>
        <button onClick={() => stop.current()}>⏹ Detener prueba</button>
        {message && <p role="status">{message}</p>}
      </div>
    </details>
  );
}
