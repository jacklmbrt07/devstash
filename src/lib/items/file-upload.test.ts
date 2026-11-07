import { describe, expect, it } from "vitest";

import {
  buildObjectKey,
  formatFileSize,
  resolveContentType,
  sanitizeFileName,
  validateUploadFile,
} from "./file-upload";

describe("validateUploadFile", () => {
  it("accepts a png image under the size limit", () => {
    expect(
      validateUploadFile({
        kind: "image",
        fileName: "shot.png",
        mimeType: "image/png",
        size: 1024,
      }),
    ).toEqual({ ok: true, contentType: "image/png" });
  });

  it("rejects oversized images", () => {
    expect(
      validateUploadFile({
        kind: "image",
        fileName: "shot.png",
        mimeType: "image/png",
        size: 6 * 1024 * 1024,
      }),
    ).toEqual({ ok: false, error: "Images must be 5 MB or smaller" });
  });

  it("rejects unsupported file extensions", () => {
    expect(
      validateUploadFile({
        kind: "file",
        fileName: "notes.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 100,
      }),
    ).toEqual({ ok: false, error: "That file type isn't supported" });
  });

  it("accepts markdown files", () => {
    expect(
      validateUploadFile({
        kind: "file",
        fileName: "readme.md",
        mimeType: "text/markdown",
        size: 2048,
      }),
    ).toEqual({ ok: true, contentType: "text/markdown" });
  });
});

describe("resolveContentType", () => {
  it("falls back to the extension when the browser sends octet-stream", () => {
    expect(resolveContentType("file", "data.json", "application/octet-stream")).toBe(
      "application/json",
    );
  });
});

describe("sanitizeFileName and buildObjectKey", () => {
  it("strips path separators from the file name", () => {
    expect(sanitizeFileName("../../secret.txt")).toBe(".._.._secret.txt");
  });

  it("prefixes the object key with the user id", () => {
    const key = buildObjectKey("user-1", "notes.md");
    expect(key.startsWith("user-1/")).toBe(true);
    expect(key.endsWith("-notes.md")).toBe(true);
  });
});

describe("formatFileSize", () => {
  it("formats bytes, kilobytes, and megabytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
