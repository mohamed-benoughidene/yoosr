import { describe, it, expect, vi } from "vitest";
import { softDelete, restoreSoftDelete, isSoftDeleted, filterActive } from "./softDelete";

describe("softDelete helpers", () => {
  describe("softDelete", () => {
    it("patches deletedAt with current timestamp", async () => {
      const mockPatch = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCtx = { db: { patch: mockPatch } } as any;

      const before = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await softDelete(mockCtx, "conversations", "conv_123" as any);
      const after = Date.now();

      expect(mockPatch).toHaveBeenCalledWith("conv_123", { deletedAt: expect.any(Number) });
      const patchedValue = mockPatch.mock.calls[0][1].deletedAt;
      expect(patchedValue).toBeGreaterThanOrEqual(before);
      expect(patchedValue).toBeLessThanOrEqual(after);
    });
  });

  describe("restoreSoftDelete", () => {
    it("clears deletedAt by setting to undefined", async () => {
      const mockPatch = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCtx = { db: { patch: mockPatch } } as any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await restoreSoftDelete(mockCtx, "conversations", "conv_123" as any);

      expect(mockPatch).toHaveBeenCalledWith("conv_123", { deletedAt: undefined });
    });
  });

  describe("isSoftDeleted", () => {
    it("returns true when deletedAt is set", () => {
      expect(isSoftDeleted({ deletedAt: Date.now() })).toBe(true);
    });

    it("returns false when deletedAt is undefined", () => {
      expect(isSoftDeleted({ deletedAt: undefined })).toBe(false);
    });

    it("returns false when deletedAt is not present", () => {
      expect(isSoftDeleted({})).toBe(false);
    });
  });

  describe("filterActive", () => {
    it("returns q.eq(q.field('deletedAt'), undefined) by default", () => {
      const mockFieldResult = { _type: "field" };
      const mockQ = {
        eq: vi.fn().mockReturnValue({ _type: "eq" }),
        field: vi.fn().mockReturnValue(mockFieldResult),
      };

      const result = filterActive(mockQ);

      expect(mockQ.field).toHaveBeenCalledWith("deletedAt");
      expect(mockQ.eq).toHaveBeenCalledWith(mockFieldResult, undefined);
      expect(result).toEqual({ _type: "eq" });
    });

    it("uses custom field name when provided", () => {
      const mockFieldResult = { _type: "field" };
      const mockQ = {
        eq: vi.fn().mockReturnValue({ _type: "eq" }),
        field: vi.fn().mockReturnValue(mockFieldResult),
      };

      filterActive(mockQ, "customField");

      expect(mockQ.field).toHaveBeenCalledWith("customField");
    });
  });
});
