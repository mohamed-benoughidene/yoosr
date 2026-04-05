import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2", "bg-red-500")).toBe("px-2 bg-red-500");
  });

  it("handles conditional classes via clsx", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn("base-class", isActive && "active-class", isDisabled && "disabled-class")
    ).toBe("base-class active-class");
  });

  it("handles empty and falsy values", () => {
    expect(cn("btn", false, null, undefined, 0)).toBe("btn");
  });

  it("resolves Tailwind conflicts correctly", () => {
    // twMerge should resolve conflicting Tailwind classes
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
