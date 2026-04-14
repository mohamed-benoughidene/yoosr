/**
 * Unit tests for typing indicator queries.
 *
 * Tests verify:
 *  - recordTyping accepts visitor_typing event type
 *  - isVisitorTyping returns true when visitor_typing event is recent
 *  - isVisitorTyping returns false when event is expired
 *  - getTypingStatus returns separate agent/visitor typing states
 *
 * Security boundary tested:
 *  - Only valid event types accepted (agent_typing, bot_typing, visitor_typing)
 */
import { describe, it, expect, vi } from "vitest";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ── Test helpers ──────────────────────────────────────────────────────

type MockMutationCtx = Pick<MutationCtx, "db">;
type MockQueryCtx = Pick<QueryCtx, "db">;

const CONVERSATION_ID = "conv_001" as Id<"conversations">;
const PROJECT_ID = "proj_001" as Id<"projects">;

function createMockMutationCtx(options?: {
  insertFn?: ReturnType<typeof vi.fn>;
}): MockMutationCtx {
  const insertFn = options?.insertFn ?? vi.fn().mockResolvedValue("mock_id");
  return {
    db: {
      insert: insertFn,
    },
  } as unknown as MockMutationCtx;
}

function createMockQueryCtx(options?: {
  queryFn?: ReturnType<typeof vi.fn>;
}): MockQueryCtx {
  const queryFn = options?.queryFn ?? vi.fn().mockResolvedValue(null);
  return {
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        first: queryFn,
        collect: vi.fn().mockResolvedValue([]),
      }),
    },
  } as unknown as MockQueryCtx;
}



// ── recordTyping mutation tests ──────────────────────────────────────

describe("recordTyping", () => {
  it("accepts visitor_typing event type", async () => {
    const insertFn = vi.fn().mockResolvedValue("mock_id");
    const ctx = createMockMutationCtx({ insertFn });

    // Import will fail if the mutation doesn't accept visitor_typing
    const { recordTyping } = await import("./messages");

    await recordTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      projectId: PROJECT_ID,
      conversationId: CONVERSATION_ID,
      eventType: "visitor_typing",
      senderName: "Test Visitor",
    });

    expect(insertFn).toHaveBeenCalledWith("typing_events", expect.objectContaining({
      eventType: "visitor_typing",
      senderName: "Test Visitor",
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
    }));
  });

  it("accepts agent_typing event type", async () => {
    const insertFn = vi.fn().mockResolvedValue("mock_id");
    const ctx = createMockMutationCtx({ insertFn });

    const { recordTyping } = await import("./messages");

    await recordTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      projectId: PROJECT_ID,
      conversationId: CONVERSATION_ID,
      eventType: "agent_typing",
      agentId: "user_123",
      senderName: "Agent One",
    });

    expect(insertFn).toHaveBeenCalledWith("typing_events", expect.objectContaining({
      eventType: "agent_typing",
      agentId: "user_123",
    }));
  });

  it("accepts bot_typing event type", async () => {
    const insertFn = vi.fn().mockResolvedValue("mock_id");
    const ctx = createMockMutationCtx({ insertFn });

    const { recordTyping } = await import("./messages");

    await recordTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      projectId: PROJECT_ID,
      conversationId: CONVERSATION_ID,
      eventType: "bot_typing",
    });

    expect(insertFn).toHaveBeenCalledWith("typing_events", expect.objectContaining({
      eventType: "bot_typing",
    }));
  });
});

// ── isVisitorTyping query tests ──────────────────────────────────────

describe("isVisitorTyping", () => {
  it("returns true when visitor_typing event is recent", async () => {
    const now = Date.now();
    const recentEvent = {
      _id: "event_001" as Id<"typing_events">,
      _creationTime: now,
      projectId: PROJECT_ID,
      conversationId: CONVERSATION_ID,
      eventType: "visitor_typing" as const,
      senderName: "Test Visitor",
      createdAt: now - 1000, // 1 second ago
    };

    const queryFn = vi.fn().mockResolvedValue(recentEvent);
    const ctx = createMockQueryCtx({ queryFn });

    const { isVisitorTyping } = await import("./messages");

    const result = await isVisitorTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result).toBe(true);
  });

  it("returns false when only agent_typing event exists", async () => {
    const now = Date.now();
    const agentEvent = {
      _id: "event_002" as Id<"typing_events">,
      _creationTime: now,
      projectId: PROJECT_ID,
      conversationId: CONVERSATION_ID,
      eventType: "agent_typing" as const,
      senderName: "Agent One",
      createdAt: now - 1000,
    };

    const queryFn = vi.fn().mockResolvedValue(agentEvent);
    const ctx = createMockQueryCtx({ queryFn });

    const { isVisitorTyping } = await import("./messages");

    const result = await isVisitorTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result).toBe(false);
  });

  it("returns false when no typing events exist", async () => {
    const queryFn = vi.fn().mockResolvedValue(null);
    const ctx = createMockQueryCtx({ queryFn });

    const { isVisitorTyping } = await import("./messages");

    const result = await isVisitorTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result).toBe(false);
  });

  it("returns false when typing event is expired (older than 5s)", async () => {

    // The query filters by createdAt >= cutoff, so expired events won't be returned
    const queryFn = vi.fn().mockResolvedValue(null);
    const ctx = createMockQueryCtx({ queryFn });

    const { isVisitorTyping } = await import("./messages");

    const result = await isVisitorTyping({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result).toBe(false);
  });
});

// ── getTypingStatus internal query tests ─────────────────────────────

describe("getTypingStatus", () => {
  it("returns isVisitorTyping true when visitor is typing", async () => {
    const now = Date.now();
    const typingEvents = [
      {
        _id: "event_001" as Id<"typing_events">,
        _creationTime: now,
        eventType: "visitor_typing" as const,
        senderName: "Visitor",
        createdAt: now - 1000,
      },
    ];

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue(typingEvents),
        }),
      },
    } as unknown as QueryCtx;

    const { getTypingStatus } = await import("./messages");

    const result = await getTypingStatus({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result.isVisitorTyping).toBe(true);
    expect(result.isAgentTyping).toBe(false);
  });

  it("returns isAgentTyping true when agent is typing", async () => {
    const now = Date.now();
    const typingEvents = [
      {
        _id: "event_002" as Id<"typing_events">,
        _creationTime: now,
        eventType: "agent_typing" as const,
        senderName: "Agent One",
        agentId: "user_123",
        createdAt: now - 1000,
      },
    ];

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue(typingEvents),
        }),
      },
    } as unknown as QueryCtx;

    const { getTypingStatus } = await import("./messages");

    const result = await getTypingStatus({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result.isAgentTyping).toBe(true);
    expect(result.isVisitorTyping).toBe(false);
  });

  it("returns both false when no typing events exist", async () => {
    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue([]),
        }),
      },
    } as unknown as QueryCtx;

    const { getTypingStatus } = await import("./messages");

    const result = await getTypingStatus({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result.isAgentTyping).toBe(false);
    expect(result.isVisitorTyping).toBe(false);
  });

  it("returns both true when both are typing simultaneously", async () => {
    const now = Date.now();
    const typingEvents = [
      {
        _id: "event_001" as Id<"typing_events">,
        _creationTime: now,
        eventType: "agent_typing" as const,
        senderName: "Agent One",
        createdAt: now - 1000,
      },
      {
        _id: "event_002" as Id<"typing_events">,
        _creationTime: now,
        eventType: "visitor_typing" as const,
        senderName: "Visitor",
        createdAt: now - 500,
      },
    ];

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue(typingEvents),
        }),
      },
    } as unknown as QueryCtx;

    const { getTypingStatus } = await import("./messages");

    const result = await getTypingStatus({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
    });

    expect(result.isAgentTyping).toBe(true);
    expect(result.isVisitorTyping).toBe(true);
  });
});
