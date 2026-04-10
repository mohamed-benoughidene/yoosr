/**
 * Unit tests for conversation ownership helpers.
 *
 * These tests mock the Convex context (ctx) to verify the authorization
 * logic without requiring a live Convex runtime.
 *
 * Security boundary tested:
 *  - Unauthenticated users are rejected
 *  - Cross-tenant (cross-org) access is blocked
 *  - Missing conversation returns a clear error
 *  - Missing project returns a clear error
 *  - Valid same-org access succeeds
 */
import { describe, it, expect, vi } from "vitest";
import { ConvexError } from "convex/values";
import { assertConversationOwnership, checkConversationOwnership } from "./auth";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

// ── Test helpers ──────────────────────────────────────────────────────

type MockCtx = Pick<QueryCtx, "auth" | "db"> | Pick<MutationCtx, "auth" | "db">;

function createMockCtx(options: {
  orgId?: string | null;
  subject?: string;
  conversation?: Doc<"conversations"> | null;
  project?: Doc<"projects"> | null;
}): MockCtx {
  const { orgId, subject, conversation, project } = options;

  const identity = orgId !== null
    ? { subject: subject ?? "user_123", org_id: orgId ?? undefined }
    : null;

  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(identity),
    },
    db: {
      get: vi.fn().mockImplementation(async (id: string) => {
        if (id === "conv_001") return conversation;
        if (conversation && id === conversation.projectId) return project;
        return null;
      }),
    },
  } as unknown as MockCtx;
}

const CONV_ID = "conv_001" as Id<"conversations">;

// ── assertConversationOwnership ──────────────────────────────────────

describe("assertConversationOwnership", () => {
  it("throws when unauthenticated", async () => {
    const ctx = createMockCtx({ orgId: null });

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow(ConvexError);

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when conversation not found", async () => {
    const ctx = createMockCtx({ orgId: "org_1", conversation: null });

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow(ConvexError);

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow("Conversation not found");
  });

  it("throws when project not found", async () => {
    const ctx = createMockCtx({
      orgId: "org_1",
      conversation: {
        _id: CONV_ID,
        _creationTime: 1,
        projectId: "proj_001" as Id<"projects">,
        visitorName: "Test",
        status: 100,
        updatedAt: Date.now(),
      } as Doc<"conversations">,
      project: null,
    });

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow("Project not found");
  });

  it("throws on cross-tenant access", async () => {
    const ctx = createMockCtx({
      orgId: "org_evil", // attacker's org
      conversation: {
        _id: CONV_ID,
        _creationTime: 1,
        projectId: "proj_001" as Id<"projects">,
        visitorName: "Test",
        status: 100,
        updatedAt: Date.now(),
      } as Doc<"conversations">,
      project: {
        _id: "proj_001" as Id<"projects">,
        _creationTime: 1,
        name: "Test Project",
        orgId: "org_1", // victim's org
      } as Doc<"projects">,
    });

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow(ConvexError);

    await expect(
      assertConversationOwnership(ctx as unknown as QueryCtx, CONV_ID)
    ).rejects.toThrow("Unauthorized");
  });

  it("returns conversation and userId on valid same-org access", async () => {
    const ctx = createMockCtx({
      orgId: "org_1",
      subject: "user_abc",
      conversation: {
        _id: CONV_ID,
        _creationTime: 1,
        projectId: "proj_001" as Id<"projects">,
        visitorName: "Test",
        status: 100,
        updatedAt: Date.now(),
      } as Doc<"conversations">,
      project: {
        _id: "proj_001" as Id<"projects">,
        _creationTime: 1,
        name: "Test Project",
        orgId: "org_1",
      } as Doc<"projects">,
    });

    const result = await assertConversationOwnership(
      ctx as unknown as QueryCtx,
      CONV_ID
    );

    expect(result.userId).toBe("user_abc");
    expect(result.conversation._id).toBe(CONV_ID);
    expect(result.identity.subject).toBe("user_abc");
  });
});

// ── checkConversationOwnership (non-throwing variant) ────────────────

describe("checkConversationOwnership", () => {
  it("returns null when unauthenticated", async () => {
    const ctx = createMockCtx({ orgId: null });
    const result = await checkConversationOwnership(
      ctx as unknown as QueryCtx,
      CONV_ID
    );
    expect(result).toBeNull();
  });

  it("returns null when conversation not found", async () => {
    const ctx = createMockCtx({ orgId: "org_1", conversation: null });
    const result = await checkConversationOwnership(
      ctx as unknown as QueryCtx,
      CONV_ID
    );
    expect(result).toBeNull();
  });

  it("returns null on cross-tenant access", async () => {
    const ctx = createMockCtx({
      orgId: "org_evil",
      conversation: {
        _id: CONV_ID,
        _creationTime: 1,
        projectId: "proj_001" as Id<"projects">,
        visitorName: "Test",
        status: 100,
        updatedAt: Date.now(),
      } as Doc<"conversations">,
      project: {
        _id: "proj_001" as Id<"projects">,
        _creationTime: 1,
        name: "Test Project",
        orgId: "org_1",
      } as Doc<"projects">,
    });

    const result = await checkConversationOwnership(
      ctx as unknown as QueryCtx,
      CONV_ID
    );
    expect(result).toBeNull();
  });

  it("returns conversation and userId on valid access", async () => {
    const ctx = createMockCtx({
      orgId: "org_1",
      subject: "user_xyz",
      conversation: {
        _id: CONV_ID,
        _creationTime: 1,
        projectId: "proj_001" as Id<"projects">,
        visitorName: "Test",
        status: 100,
        updatedAt: Date.now(),
      } as Doc<"conversations">,
      project: {
        _id: "proj_001" as Id<"projects">,
        _creationTime: 1,
        name: "Test Project",
        orgId: "org_1",
      } as Doc<"projects">,
    });

    const result = await checkConversationOwnership(
      ctx as unknown as QueryCtx,
      CONV_ID
    );

    expect(result).not.toBeNull();
    expect(result!.userId).toBe("user_xyz");
    expect(result!.conversation._id).toBe(CONV_ID);
    expect(result!.identity.subject).toBe("user_xyz");
  });
});
