import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  chooseVoice,
  getVoicePreference,
  setVoicePreference,
  narrate,
  stopNarration,
  spokenText,
  speechChunks,
} from "../src/features/narration/speech";
const voice = (name: string, lang: string, localService: boolean) =>
  ({
    name,
    lang,
    localService,
    voiceURI: name,
    default: false,
  }) as SpeechSynthesisVoice;
let utterances: SpeechSynthesisUtterance[];
let audios: {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
}[];
let cancel: ReturnType<typeof vi.fn>;
beforeEach(() => {
  utterances = [];
  audios = [];
  cancel = vi.fn();
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => storage.set(k, v),
  });
  vi.stubGlobal("navigator", { onLine: true });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    SpeechSynthesisUtterance,
    speechSynthesis: {
      getVoices: () => [voice("Helena", "es-ES", true)],
      speak: (u: SpeechSynthesisUtterance) => utterances.push(u),
      cancel,
    },
    Audio: class {
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
      constructor() {
        audios.push(this);
      }
    },
  });
  setVoicePreference({ mode: "browser", voiceURI: "" });
  cancel.mockClear();
});
afterEach(() => {
  stopNarration();
  vi.unstubAllGlobals();
});
it("prefiere voz instalada para autonomía offline y respeta una elección explícita", () => {
  const local = voice("Helena", "es-ES", true),
    cloud = voice("Salome", "es-CO", false);
  expect(chooseVoice([cloud, local], "", true)).toBe(local);
  expect(chooseVoice([cloud, local], "Salome", true)).toBe(cloud);
  expect(chooseVoice([cloud, local], "Salome", false)).toBe(local);
  expect(chooseVoice([cloud], "Salome", false)).toBeUndefined();
  expect(
    chooseVoice([voice("English", "en-US", true)], "", true),
  ).toBeUndefined();
});
it("conserva la elección local y tolera preferencias inválidas", () => {
  setVoicePreference({ mode: "recorded", voiceURI: "Helena" });
  expect(getVoicePreference()).toEqual({
    mode: "recorded",
    voiceURI: "Helena",
  });
  localStorage.setItem("manta-voice-v1", "invalid");
  expect(getVoicePreference().mode).toBe("browser");
});
it("pronuncia operaciones, fracciones y decimales completos", () => {
  expect(spokenText("4 × 3 = 12; 0,005 L; 1/4")).toBe(
    "4 por 3 igual a 12; 0 coma 0 0 5 litros; 1 de 4 partes",
  );
});
it("narra el guion y detiene la instrucción anterior antes de la pista", () => {
  narrate("inicio", 0.8);
  expect(utterances[0].text.length).toBeGreaterThan(20);
  expect(utterances[0].lang).toBe("es-ES");
  expect(utterances[0].rate).toBe(0.8);
  narrate("ruta");
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(utterances).toHaveLength(2);
});
it("un cierre tardío de una locución terminada no cancela la nueva", () => {
  const oldStop = narrate("guardado");
  utterances[0].onend?.({} as SpeechSynthesisEvent);
  narrate("ruta");
  oldStop();
  expect(cancel).not.toHaveBeenCalled();
});
it("un fallo del navegador reproduce el respaldo y detener impide un respaldo tardío", async () => {
  const stop = narrate("inicio");
  utterances[0].onerror?.({} as SpeechSynthesisErrorEvent);
  expect(audios[0].play).toHaveBeenCalledTimes(1);
  stop();
  expect(audios[0].pause).toHaveBeenCalledTimes(1);
  narrate("ruta");
  const lateError = utterances[1].onerror;
  stopNarration();
  lateError?.({} as SpeechSynthesisErrorEvent);
  expect(audios).toHaveLength(1);
});
it("la elección de audios guardados evita el sintetizador", () => {
  setVoicePreference({ mode: "recorded", voiceURI: "" });
  narrate("inicio");
  expect(utterances).toHaveLength(0);
  expect(audios[0].play).toHaveBeenCalled();
});

it("recorre todas las frases de una instrucción larga y conserva el texto completo", () => {
  const text = "Observa las semillas y cuenta los grupos. ".repeat(15).trim();
  const chunks = speechChunks(text);
  expect(chunks.every((c) => c.length <= 180)).toBe(true);
  expect(chunks.join(" ")).toBe(text);
  const stopped = vi.fn();
  const stop = narrate("g5-lengua-castellana-p4-teatro-13", 1, {
    onPlaying: stopped,
  });
  expect(utterances).toHaveLength(1);
  utterances[0].onend?.({} as SpeechSynthesisEvent);
  expect(utterances).toHaveLength(2);
  for (let i = 1; i < utterances.length; i++)
    utterances[i].onend?.({} as SpeechSynthesisEvent);
  expect(utterances.length).toBeGreaterThan(4);
  expect(stopped).toHaveBeenLastCalledWith(false);
  stop();
  expect(cancel).not.toHaveBeenCalled();
});
