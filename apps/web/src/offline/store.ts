import { openDB } from "idb";
export type Profile = {
  id: string;
  alias: string;
  grade: number;
  avatar: string;
  group: string;
  support: "visual" | "guiado" | "autonomo";
  assigned: boolean;
  assignedUnits?: string[];
};
export type Attempt = {
  value: string | number;
  correct: boolean;
  at: string;
  hints: number;
};
export type Progress = {
  profileId: string;
  unitId: string;
  version: number;
  index: number;
  completed: string[];
  attempts: Record<string, Attempt[]>;
  hints: Record<string, number>;
  selfReport?: string;
  finished: boolean;
  updatedAt: string;
};
const db = () =>
  openDB("manta-aprende", 1, {
    upgrade(d) {
      d.createObjectStore("profiles", { keyPath: "id" });
      d.createObjectStore("progress", { keyPath: ["profileId", "unitId"] });
    },
  });
export async function profiles() {
  return (await db()).getAll("profiles") as Promise<Profile[]>;
}
export async function putProfile(p: Profile) {
  await (await db()).put("profiles", p);
}
export async function loadProgress(profileId: string, unitId: string) {
  return (await db()).get("progress", [profileId, unitId]) as Promise<
    Progress | undefined
  >;
}
export async function saveProgress(p: Progress) {
  await (await db()).put("progress", p);
}
export async function allProgress() {
  return (await db()).getAll("progress") as Promise<Progress[]>;
}
export async function deleteProfile(id: string) {
  const d = await db();
  const tx = d.transaction(["profiles", "progress"], "readwrite");
  await tx.objectStore("profiles").delete(id);
  for (const k of await tx.objectStore("progress").getAllKeys())
    if (Array.isArray(k) && k[0] === id)
      await tx.objectStore("progress").delete(k);
  await tx.done;
}
export function newProgress(
  profileId: string,
  unitId: string,
  version: number,
): Progress {
  return {
    profileId,
    unitId,
    version,
    index: 0,
    completed: [],
    attempts: {},
    hints: {},
    finished: false,
    updatedAt: new Date().toISOString(),
  };
}
