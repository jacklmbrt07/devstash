const LINE_HEIGHT = 19;
const EDITOR_PADDING = 16;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  md: "markdown",
  "c++": "cpp",
  "c#": "csharp",
};

export function isCodeItemType(typeName: string): boolean {
  return typeName === "snippet" || typeName === "command";
}

export function monacoLanguage(language: string | null | undefined): string {
  const raw = language?.trim().toLowerCase() ?? "";
  if (!raw) return "plaintext";
  return LANGUAGE_ALIASES[raw] ?? raw;
}

export function editorHeight(value: string): number {
  const lines = Math.max(value.split("\n").length, 4);
  return Math.min(
    MAX_HEIGHT,
    Math.max(MIN_HEIGHT, lines * LINE_HEIGHT + EDITOR_PADDING),
  );
}
