import transcripts from "../../../public/audio/transcripts.json";
import { audioFile } from "../../data/audio";

export type VoicePreference = {
  mode: "browser" | "recorded";
  voiceURI: string;
};
const defaultMode =
  import.meta.env.VITE_MANTA_DISTRIBUTION === "android"
    ? "recorded"
    : "browser";
const preferenceKey = "manta-voice-v1";
export const preferenceEvent = "manta-voice-change";
let sessionPreference: VoicePreference | undefined;
export function getVoicePreference(): VoicePreference {
  if (sessionPreference) return sessionPreference;
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey) ?? "null");
    return {
      mode:
        saved?.mode === "recorded" || saved?.mode === "browser"
          ? saved.mode
          : defaultMode,
      voiceURI: typeof saved?.voiceURI === "string" ? saved.voiceURI : "",
    };
  } catch {
    return { mode: defaultMode, voiceURI: "" };
  }
}
export function setVoicePreference(preference: VoicePreference) {
  stopNarration();
  let stored = true;
  try {
    localStorage.setItem(preferenceKey, JSON.stringify(preference));
    sessionPreference = undefined;
  } catch {
    stored = false;
    sessionPreference = preference;
  }
  window.dispatchEvent(new Event(preferenceEvent));
  return stored;
}
export function spanishVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => /^es(?:[-_]|$)/i.test(v.lang));
}
export function chooseVoice(
  voices: SpeechSynthesisVoice[],
  uri: string,
  online: boolean,
) {
  const available = voices.filter(
    (v) => /^es(?:[-_]|$)/i.test(v.lang) && (online || v.localService),
  );
  const selected = available.find((v) => v.voiceURI === uri);
  if (selected) return selected;
  const score = (v: SpeechSynthesisVoice) =>
    (v.localService ? 100 : 0) +
    (/^es[-_]CO$/i.test(v.lang) ? 30 : 0) +
    (/Salom[eé]|Dalia|Helena|Sabina|Monica|Mónica|Paulina|Elvira|Laura/i.test(
      v.name,
    )
      ? 10
      : 0) +
    (v.default ? 1 : 0);
  return [...available].sort((a, b) => score(b) - score(a))[0];
}
export function spokenText(text: string) {
  return text
    .replace(/(\d+),(\d+)/g, (_, a, b) => `${a} coma ${b.split("").join(" ")}`)
    .replace(/(\d+)\/(\d+)/g, "$1 de $2 partes")
    .replaceAll("×", " por ")
    .replaceAll("÷", " dividido entre ")
    .replaceAll("−", " menos ")
    .replaceAll("+", " más ")
    .replaceAll("=", " igual a ")
    .replaceAll("cm²", "centímetros cuadrados")
    .replaceAll("cm³", "centímetros cúbicos")
    .replace(/\bkg\b/g, "kilogramos")
    .replace(/\bcm\b/g, "centímetros")
    .replace(/\bL\b/g, "litros")
    .replace(/\s+/g, " ")
    .trim();
}

export function speechChunks(text: string) {
  const chunks: string[] = [];
  let remaining = spokenText(text);
  while (remaining.length > 180) {
    const fragment = remaining.slice(0, 180);
    const boundaries = [...fragment.matchAll(/[.!?;:]\s/g)];
    const boundary = boundaries.at(-1)?.index;
    const cut =
      boundary !== undefined && boundary >= 60
        ? boundary + 1
        : fragment.lastIndexOf(" ");
    const end = cut > 0 ? cut : 180;
    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

type Callbacks = {
  localAudio?: HTMLAudioElement;
  onPlaying?: (playing: boolean) => void;
  onMessage?: (message: string) => void;
};
let active: (() => void) | undefined;
export function stopNarration() {
  active?.();
}

// A single owner prevents instructions, hints and feedback speaking over each other.
export function narrate(id: string, rate = 1, callbacks: Callbacks = {}) {
  stopNarration();
  let stopped = false;
  let player: HTMLAudioElement | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  let startTimer: ReturnType<typeof setTimeout> | undefined;
  let cancelSpeech = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(startTimer);
    player?.pause();
    if (utterance) {
      utterance.onend = null;
      utterance.onerror = null;
      utterance.onstart = null;
    }
    if (cancelSpeech) window.speechSynthesis.cancel();
    callbacks.onPlaying?.(false);
    if (active === stop) active = undefined;
  };
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelSpeech = false;
    callbacks.onPlaying?.(false);
    clearTimeout(startTimer);
    if (active === stop) active = undefined;
  };
  active = stop;
  callbacks.onMessage?.("");
  const recorded = (message = "") => {
    if (stopped || player) return;
    clearTimeout(startTimer);
    if (utterance) {
      utterance.onend = null;
      utterance.onerror = null;
      utterance.onstart = null;
    }
    if (cancelSpeech) {
      window.speechSynthesis.cancel();
      cancelSpeech = false;
    }
    callbacks.onMessage?.(message);
    player = callbacks.localAudio ?? new window.Audio(audioFile(id));
    player.currentTime = 0;
    player.playbackRate = rate;
    player.onended = finish;
    player.onerror = () => {
      if (!stopped)
        callbacks.onMessage?.(
          "No se pudo abrir el audio local. Revisa la preparación sin conexión.",
        );
      finish();
    };
    player
      .play()
      .then(() => {
        if (!stopped) callbacks.onPlaying?.(true);
      })
      .catch(() => {
        if (!stopped)
          callbacks.onMessage?.(
            "Pulsa Escuchar. Revisa el volumen; también puedes seguir las imágenes y el texto.",
          );
        finish();
      });
  };
  const preference = getVoicePreference();
  const text = (transcripts as Record<string, string>)[id];
  const voice = chooseVoice(
    spanishVoices(),
    preference.voiceURI,
    navigator.onLine,
  );
  if (preference.mode === "recorded") recorded();
  else if (!voice || !text || !("SpeechSynthesisUtterance" in window))
    recorded(
      "Usamos el audio guardado: no hay una voz en español disponible en este equipo.",
    );
  else {
    const chunks = speechChunks(text);
    const speakChunk = (index: number) => {
      if (stopped) return;
      try {
        utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = rate === 1 ? 0.95 : rate;
        utterance.onstart = () => {
          clearTimeout(startTimer);
          if (!stopped) callbacks.onPlaying?.(true);
        };
        utterance.onend = () => {
          clearTimeout(startTimer);
          if (stopped) return;
          if (index + 1 < chunks.length) speakChunk(index + 1);
          else finish();
        };
        utterance.onerror = () =>
          recorded(
            "La voz del navegador no pudo hablar. Usamos el audio guardado.",
          );
        // Some browsers reject automatic narration without firing an error event.
        startTimer = setTimeout(
          () =>
            recorded(
              "Pulsa Escuchar. La voz del navegador no inició; usamos el audio guardado.",
            ),
          6000,
        );
        cancelSpeech = true;
        window.speechSynthesis.speak(utterance);
      } catch {
        recorded(
          "La voz del navegador no pudo hablar. Usamos el audio guardado.",
        );
      }
    };
    speakChunk(0);
  }

  return stop;
}
