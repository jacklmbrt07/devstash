import { describe, expect, it } from "vitest";

import { httpUrlSchema, safeExternalUrl } from "./safe-url";

describe("httpUrlSchema", () => {
  it("accepts http and https URLs", () => {
    expect(httpUrlSchema.parse("https://example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(httpUrlSchema.parse("http://example.com")).toBe("http://example.com");
  });

  it("rejects non-http protocols", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "ftp://files.example.com",
      "file:///etc/passwd",
    ]) {
      const result = httpUrlSchema.safeParse(url);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Enter a valid URL");
      }
    }
  });
});

describe("safeExternalUrl", () => {
  it("returns http(s) URLs unchanged", () => {
    expect(safeExternalUrl(" https://example.com ")).toBe("https://example.com");
    expect(safeExternalUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("returns null for blank, invalid, or unsafe schemes", () => {
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl("")).toBeNull();
    expect(safeExternalUrl("   ")).toBeNull();
    expect(safeExternalUrl("not a url")).toBeNull();
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
  });
});
