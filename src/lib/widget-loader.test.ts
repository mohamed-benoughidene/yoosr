import { describe, it, expect } from "vitest";
import { buildWidgetIframeSrc, validateProjectId } from "./widget-loader";

describe("widget-loader", () => {
  describe("validateProjectId", () => {
    it("should return true for valid project IDs", () => {
      expect(validateProjectId("abc123")).toBe(true);
      expect(validateProjectId("mx792dt3gv4z3wdh82jwacdzth84qtwg")).toBe(true);
      expect(validateProjectId("test-project-id")).toBe(true);
    });

    it("should reject empty strings", () => {
      expect(validateProjectId("")).toBe(false);
    });

    it("should reject whitespace-only strings", () => {
      expect(validateProjectId("   ")).toBe(false);
      expect(validateProjectId("\t\n")).toBe(false);
    });

    it("should reject null and undefined", () => {
      expect(validateProjectId(null as unknown as string)).toBe(false);
      expect(validateProjectId(undefined as unknown as string)).toBe(false);
    });

    it("should reject strings with injection characters", () => {
      expect(validateProjectId("abc<script>alert(1)</script>")).toBe(false);
      expect(validateProjectId("abc\"onclick=\"evil\"")).toBe(false);
      expect(validateProjectId("abc'onmouseover='evil'")).toBe(false);
    });

    it("should reject strings that are too long", () => {
      const tooLong = "a".repeat(256);
      expect(validateProjectId(tooLong)).toBe(false);
    });

    it("should accept alphanumeric with hyphens and underscores", () => {
      expect(validateProjectId("my-project_123")).toBe(true);
      expect(validateProjectId("a-b_c")).toBe(true);
    });
  });

  describe("buildWidgetIframeSrc", () => {
    it("should build a basic iframe src URL", () => {
      const src = buildWidgetIframeSrc("abc123");
      expect(src).toContain("/widget");
      expect(src).toContain("projectId=abc123");
    });

    it("should use the provided baseUrl", () => {
      const src = buildWidgetIframeSrc("abc123", { baseUrl: "https://yoosr.io/widget" });
      expect(src).toBe("https://yoosr.io/widget?projectId=abc123");
    });

    it("should default to origin when baseUrl not provided", () => {
      const src = buildWidgetIframeSrc("abc123");
      expect(src).toMatch(/^\/widget\?projectId=abc123$/);
    });

    it("should reject special characters that would break URL encoding", () => {
      // Characters like /, <, >, ", ' are rejected outright for security
      expect(() => buildWidgetIframeSrc("abc/123")).toThrow("Invalid projectId");
    });

    it("should append additional options as query params", () => {
      const src = buildWidgetIframeSrc("abc123", {
        baseUrl: "https://yoosr.io",
        theme: "dark",
        lang: "ar",
      });
      expect(src).toContain("projectId=abc123");
      expect(src).toContain("theme=dark");
      expect(src).toContain("lang=ar");
    });

    it("should throw if projectId is invalid", () => {
      expect(() => buildWidgetIframeSrc("")).toThrow("Invalid projectId");
      expect(() => buildWidgetIframeSrc("   ")).toThrow("Invalid projectId");
      expect(() => buildWidgetIframeSrc(null as unknown as string)).toThrow("Invalid projectId");
    });

    it("should handle RTL direction parameter", () => {
      const src = buildWidgetIframeSrc("abc123", {
        baseUrl: "https://yoosr.io",
        dir: "rtl",
      });
      expect(src).toContain("dir=rtl");
    });

    it("should not include undefined optional params", () => {
      const src = buildWidgetIframeSrc("abc123", {
        baseUrl: "https://yoosr.io/widget",
        theme: undefined,
      });
      expect(src).toBe("https://yoosr.io/widget?projectId=abc123");
    });
  });
});
