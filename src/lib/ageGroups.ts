/**
 * The five learning groups (same list as the server, server/src/utils/ageGroups.ts).
 *
 * `start` is what a child in that group begins with. It is advice shown to parents and used to order the
 * learning path. It never locks anyone out: a parent can pick a different group for their child.
 */
export type AgeGroupId = "4-6" | "7-9" | "10-12" | "13-15" | "16-18";

export interface AgeGroup {
  id: AgeGroupId;
  range: string;
  name: string;
  emoji: string;
  /** One line a parent can read: what the child starts with. */
  start: string;
  /** The path, in order. */
  path: string[];
}

export const AGE_GROUPS: AgeGroup[] = [
  { id: "4-6", range: "4–6", name: "Tots", emoji: "🤖", start: "Starts with block coding (drag and drop). No reading or typing needed.", path: ["Blocks (Scratch-style)", "Simple games with blocks"] },
  { id: "7-9", range: "7–9", name: "Explorers", emoji: "🧩", start: "Starts with block coding: make characters move, jump and play.", path: ["Blocks (Scratch-style)", "First steps in HTML"] },
  { id: "10-12", range: "10–12", name: "Builders", emoji: "🎮", start: "Starts with block coding, then moves on to typing HTML and CSS.", path: ["Blocks (Scratch-style)", "HTML", "CSS"] },
  { id: "13-15", range: "13–15", name: "Coders", emoji: "💻", start: "Starts with HTML and CSS, then JavaScript.", path: ["HTML", "CSS", "JavaScript"] },
  { id: "16-18", range: "16–18", name: "Creators", emoji: "🚀", start: "Goes straight to HTML, CSS and JavaScript projects.", path: ["HTML and CSS", "JavaScript projects", "Bigger builds"] },
];

export const ageGroupOf = (age: number): AgeGroupId => {
  if (age <= 6) return "4-6";
  if (age <= 9) return "7-9";
  if (age <= 12) return "10-12";
  if (age <= 15) return "13-15";
  return "16-18";
};

export const groupById = (id?: string | null): AgeGroup | undefined => AGE_GROUPS.find((g) => g.id === id);

/** "Ages 7–9 · Explorers" */
export const groupLabel = (id?: string | null): string => {
  const g = groupById(id);
  return g ? `Ages ${g.range} · ${g.name}` : "";
};

/** Is something (a course or lesson) meant for this group? No groups listed means everyone. */
export const isForGroup = (groups: string[] | null | undefined, group?: string | null): boolean =>
  !groups || groups.length === 0 || !group || groups.includes(group);
