import { VoiceSettings } from "../narration/VoiceSettings";
export function Settings({
  large,
  contrast,
  onLarge,
  onContrast,
}: {
  large: boolean;
  contrast: boolean;
  onLarge: () => void;
  onContrast: () => void;
}) {
  return (
    <div className="accessibility" aria-label="Apoyos de lectura">
      <VoiceSettings />
      <button aria-pressed={large} onClick={onLarge}>
        A＋ Texto grande
      </button>
      <button aria-pressed={contrast} onClick={onContrast}>
        ◐ Alto contraste
      </button>
    </div>
  );
}
