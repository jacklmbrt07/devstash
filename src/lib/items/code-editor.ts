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

export interface CodeLanguageOption {
  value: string;
  label: string;
}

export const CODE_LANGUAGE_OPTIONS: readonly CodeLanguageOption[] = [
  { value: "", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
];

/** Options for a language `<select>`, keeping unknown stored values selectable. */
export function languageSelectOptions(
  current?: string | null,
): CodeLanguageOption[] {
  const options = CODE_LANGUAGE_OPTIONS.map((option) => ({ ...option }));
  const raw = current?.trim() ?? "";
  if (raw && !options.some((option) => option.value === raw)) {
    options.push({ value: raw, label: raw });
  }
  return options;
}

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
