import type { SavedProject } from "@/lib/scoping/types";

export const PROJECTS_STORAGE_KEY = "sahibuild_projects";
export const PROJECTS_STORAGE_EVENT = "sahibuild_projects_change";

const LEGACY_PROJECTS_STORAGE_KEY = "bw_projects";

export function readProjectsRaw(): string | null {
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw !== null) return raw;
    return window.localStorage.getItem(LEGACY_PROJECTS_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readProjects(): SavedProject[] {
  const raw = readProjectsRaw();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeProjects(projects: SavedProject[]) {
  window.localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify(projects),
  );
  window.dispatchEvent(new Event(PROJECTS_STORAGE_EVENT));
}
