import { describe, expect, it } from "vitest";

import {
  CODE_LANGUAGE_OPTIONS,
  editorHeight,
  isCodeItemType,
  languageSelectOptions,
  monacoLanguage,
} from "./code-editor";

describe("isCodeItemType", () => {
  it("returns true for snippet and command", () => {
    expect(isCodeItemType("snippet")).toBe(true);
    expect(isCodeItemType("command")).toBe(true);
  });

  it("returns false for non-code types", () => {
    expect(isCodeItemType("prompt")).toBe(false);
    expect(isCodeItemType("note")).toBe(false);
    expect(isCodeItemType("link")).toBe(false);
    expect(isCodeItemType("")).toBe(false);
  });
});

describe("monacoLanguage", () => {
  it("maps common aliases to Monaco language ids", () => {
    expect(monacoLanguage("ts")).toBe("typescript");
    expect(monacoLanguage("JSX")).toBe("javascript");
    expect(monacoLanguage(" py ")).toBe("python");
    expect(monacoLanguage("bash")).toBe("shell");
    expect(monacoLanguage("C++")).toBe("cpp");
  });

  it("falls back to plaintext when empty and keeps unknown languages", () => {
    expect(monacoLanguage(null)).toBe("plaintext");
    expect(monacoLanguage(undefined)).toBe("plaintext");
    expect(monacoLanguage("   ")).toBe("plaintext");
    expect(monacoLanguage("Rust")).toBe("rust");
  });
});

describe("languageSelectOptions", () => {
  it("includes the curated language list", () => {
    const options = languageSelectOptions();
    expect(options[0]).toEqual({ value: "", label: "Plain text" });
    expect(options).toEqual(
      expect.arrayContaining([
        { value: "typescript", label: "TypeScript" },
        { value: "bash", label: "Bash / Shell" },
      ]),
    );
    expect(options).toHaveLength(CODE_LANGUAGE_OPTIONS.length);
  });

  it("appends an unknown current language so the select stays valid", () => {
    const options = languageSelectOptions(" elixir ");
    expect(options.at(-1)).toEqual({ value: "elixir", label: "elixir" });
  });

  it("does not duplicate a language that is already listed", () => {
    const options = languageSelectOptions("typescript");
    expect(
      options.filter((option) => option.value === "typescript"),
    ).toHaveLength(1);
  });
});

describe("editorHeight", () => {
  it("uses a minimum height for short content", () => {
    expect(editorHeight("one line")).toBe(120);
    expect(editorHeight("a\nb\nc")).toBe(120);
  });

  it("grows with line count and caps at 400", () => {
    const tenLines = Array.from({ length: 10 }, (_, i) => `line ${i}`).join(
      "\n",
    );
    expect(editorHeight(tenLines)).toBe(10 * 19 + 16);

    const manyLines = Array.from({ length: 80 }, (_, i) => `line ${i}`).join(
      "\n",
    );
    expect(editorHeight(manyLines)).toBe(400);
  });
});
