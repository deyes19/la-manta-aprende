import files from "./audio-files.json";
export const audioFile = (id: string) =>
  `/audio/${(files as Record<string, string>)[id] ?? id}.mp3`;
