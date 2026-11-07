import type { Extension } from "@codemirror/state";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { solarizedDark, solarizedLight } from "@uiw/codemirror-theme-solarized";

export interface EditorTheme {
  id: string;
  label: string;
  dark: boolean;
  extension: Extension;
}

/** Colour themes for the code editor, like the ones people know from VS Code. */
export const EDITOR_THEMES: EditorTheme[] = [
  { id: "vscode-dark", label: "VS Code Dark", dark: true, extension: vscodeDark },
  { id: "vscode-light", label: "VS Code Light", dark: false, extension: vscodeLight },
  { id: "dracula", label: "Dracula", dark: true, extension: dracula },
  { id: "monokai", label: "Monokai", dark: true, extension: monokai },
  { id: "tokyo-night", label: "Tokyo Night", dark: true, extension: tokyoNight },
  { id: "github-dark", label: "GitHub Dark", dark: true, extension: githubDark },
  { id: "github-light", label: "GitHub Light", dark: false, extension: githubLight },
  { id: "solarized-dark", label: "Solarized Dark", dark: true, extension: solarizedDark },
  { id: "solarized-light", label: "Solarized Light", dark: false, extension: solarizedLight },
];

export interface EditorPrefs {
  theme: string;
  fontSize: number;
  wrap: boolean;
}

export const DEFAULT_PREFS: EditorPrefs = { theme: "vscode-dark", fontSize: 15, wrap: false };
export const FONT_MIN = 11;
export const FONT_MAX = 24;

const KEY = "akili-editor-prefs";

/** Settings are remembered on this device. Storage can be blocked (private windows), so every use is guarded. */
export const loadPrefs = (): EditorPrefs => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<EditorPrefs>;
    return {
      theme: EDITOR_THEMES.some((t) => t.id === raw.theme) ? (raw.theme as string) : DEFAULT_PREFS.theme,
      fontSize: typeof raw.fontSize === "number" ? Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(raw.fontSize))) : DEFAULT_PREFS.fontSize,
      wrap: typeof raw.wrap === "boolean" ? raw.wrap : DEFAULT_PREFS.wrap,
    };
  } catch {
    return DEFAULT_PREFS;
  }
};

export const savePrefs = (prefs: EditorPrefs) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* not saved, still works for this visit */
  }
};

export const themeById = (id: string): EditorTheme => EDITOR_THEMES.find((t) => t.id === id) ?? EDITOR_THEMES[0];
