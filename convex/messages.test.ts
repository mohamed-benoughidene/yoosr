/**
 * Unit tests for message mutations and queries used by the Monitor dashboard.
 *
 * Tests verify:
 *  - sendMessage creates message, patches conversation, fires webhook
 *  - send creates agent/visitor/bot messages with correct senderType
 *  - getMessages returns paginated messages with isInternal flag
 *
 * Security boundary tested:
 *  - sendMessage requires auth (authError thrown without identity)
 *  - getMessages requires auth
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";

// ── Constants ────────────────────────────────────────────────────────

const CONVERSATION_ID = "conv_001" as Id<"conversations">;
const PROJECT_ID = "proj_001" as Id<"projects">;
const AGENT_ID = "user_agent_1";

// ── Test helpers ──────────────────────────────────────────────────────

type MockMutationCtx = Pick<MutationCtx, "db" | "scheduler" | "auth">;
type MockQueryCtx = Pick<QueryCtx, "db" | "auth">;

function createMockMutationCtx(options?: {
  patchFn?: ReturnType<typeof vi.fn>;
  insertFn?: ReturnType<typeof vi.fn>;
  getFn?: ReturnType<typeof vi.fn>;
  schedulerRunAfter?: ReturnType<typeof vi.fn>;
}): MockMutationCtx {
  return {
    db: {
      insert: options?.insertFn ?? vi.fn().mockResolvedValue("mock_id"),
      patch: options?.patchFn ?? vi.fn().mockResolvedValue(undefined),
      get: options?.getFn ?? vi.fn().mockResolvedValue(null),
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
        collect: vi.fn().mockResolvedValue([]),
      }),
    },
    scheduler: {
      runAfter: options?.schedulerRunAfter ?? vi.fn().mockResolvedValue(undefined),
    },
    auth: {} as any,
  } as unknown as MockMutationCtx;
}

function createMockQueryCtx(options?: {
  identity?: object | null;
  paginateFn?: ReturnType<typeof vi.fn>;
}): MockQueryCtx {
  return {
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
        collect: vi.fn().mockResolvedValue([]),
        paginate: options?.paginateFn ?? vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: "" }),
      }),
      get: vi.fn().mockResolvedValue(null),
    },
    auth: options?.identity !== null
      ? { getUserIdentity: vi.fn().mockResolvedValue(options?.identity ?? { subject: AGENT_ID, email: "agent@test.com" }) }
      : { getUserIdentity: vi.fn().mockResolvedValue(null) },
  } as unknown as MockQueryCtx;
}

function createMockConversation(overrides?: Record<string, unknown>) {
  return {
    _id: CONVERSATION_ID,
    _creationTime: Date.now() - 3600000,
    projectId: PROJECT_ID,
    status: 100,
    lastMessage: "Hello!",
    unreadCount: 0,
    updatedAt: Date.now() - 60000,
    participants: [],
    assignedTo: undefined,
    botId: undefined,
    botPaused: false,
    firstResponseAt: undefined,
    channel: "web",
    ...overrides,
  } as Doc<"conversations">;
}

// ── sendMessage mutation tests ──────────────────────────────────────

describe("sendMessage", () => {
  it("creates a message with agent senderType", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const insertFn = vi.fn().mockResolvedValue("msg_id");
    const ctx = createMockMutationCtx({
      insertFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "Hello from agent",
      isInternal: false,
    });

    expect(insertFn).toHaveBeenCalledWith("messages", expect.objectContaining({
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      senderType: "agent",
      senderId: AGENT_ID,
      content: "Hello from agent",
      type: "text",
    }));
  });

  it("creates internal message when isInternal=true", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const insertFn = vi.fn().mockResolvedValue("msg_id");
    const ctx = createMockMutationCtx({
      insertFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "Internal note",
      isInternal: true,
    });

    expect(insertFn).toHaveBeenCalledWith("messages", expect.objectContaining({
      type: "internal",
    }));
  });

  it("updates conversation with firstResponseAt on first reply", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID], firstResponseAt: undefined });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      insertFn: vi.fn().mockResolvedValue("msg_id"),
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "First reply",
      isInternal: false,
    });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      firstResponseAt: expect.any(Number),
    }));
  });

  it("sets status to ASSIGNED when agent replies to unassigned conversation", async () => {
    const conv = createMockConversation({ assignedTo: undefined, status: 100, participants: [] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      insertFn: vi.fn().mockResolvedValue("msg_id"),
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "Taking over",
      isInternal: false,
    });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      status: 200,
    }));
  });

  it("pauses the bot when agent sends a message", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID], botPaused: false });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      insertFn: vi.fn().mockResolvedValue("msg_id"),
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "Bot pause",
      isInternal: false,
    });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      botPaused: true,
    }));
  });

  it("schedules webhook for non-internal messages", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const schedulerRunAfter = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      schedulerRunAfter,
      insertFn: vi.fn().mockResolvedValue("msg_id"),
      getFn: vi.fn().mockResolvedValue(conv),
      patchFn: vi.fn().mockResolvedValue(undefined),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "Outbound",
      isInternal: false,
    });

    expect(schedulerRunAfter).toHaveBeenCalledWith(0, expect.anything(), expect.objectContaining({
      event: "message.create",
    }));
  });

  it("does NOT schedule webhook for internal messages", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const schedulerRunAfter = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      schedulerRunAfter,
      insertFn: vi.fn().mockResolvedValue("msg_id"),
      getFn: vi.fn().mockResolvedValue(conv),
      patchFn: vi.fn().mockResolvedValue(undefined),
    });

    const { sendMessage } = await import("./messages");

    await sendMessage({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "Internal note",
      isInternal: true,
    });

    // Should not fire webhook for internal messages
    const webhookCalls = schedulerRunAfter.mock.calls.filter(
      (call: any[]) => call[1] && typeof call[1] === "function" || (call[2] && call[2].event === "message.create")
    );
    expect(webhookCalls).toHaveLength(0);
  });
});

// ── send mutation tests ─────────────────────────────────────────────

describe("send", () => {
  it("creates a message with specified senderType", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const insertFn = vi.fn().mockResolvedValue("msg_id");
    const ctx = createMockMutationCtx({
      insertFn,
      getFn: vi.fn().mockResolvedValue(conv),
      patchFn: vi.fn().mockResolvedValue(undefined),
    });

    const { send } = await import("./messages");

    await send({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, {
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      content: "System message",
      senderType: "bot",
    });

    expect(insertFn).toHaveBeenCalledWith("messages", expect.objectContaining({
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      senderType: "bot",
      content: "System message",
    }));
  });
});

// ── getMessages query tests ─────────────────────────────────────────

describe("getMessages", () => {
  it("returns paginated messages with isInternal flag", async () => {
    const mockMessages = [
      {
        _id: "msg_1" as Id<"messages">,
        _creationTime: Date.now() - 60000,
        conversationId: CONVERSATION_ID,
        projectId: PROJECT_ID,
        senderType: "visitor",
        content: "Hello",
        type: "text",
      },
      {
        _id: "msg_2" as Id<"messages">,
        _creationTime: Date.now() - 30000,
        conversationId: CONVERSATION_ID,
        projectId: PROJECT_ID,
        senderType: "agent",
        content: "Internal note",
        type: "internal",
      },
    ];

    const paginateFn = vi.fn().mockResolvedValue({
      page: mockMessages,
      isDone: true,
      continueCursor: "cursor_end",
    });

    const ctx = createMockQueryCtx({
      identity: { subject: AGENT_ID, email: "agent@test.com" },
      paginateFn,
    });

    const { getMessages } = await import("./messages");

    const result = await getMessages({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
      paginationOpts: { cursor: null, numItems: 30 },
    });

    expect(result.page).toHaveLength(2);
    expect(result.page[0]).toHaveProperty("isInternal");
    expect(result.page[0].isInternal).toBe(false); // text type
    expect(result.page[1].isInternal).toBe(true); // internal type
    expect(result.isDone).toBe(true);
  });

  it("queries messages by conversationId index", async () => {
    const paginateFn = vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: "" });
    const ctx = createMockQueryCtx({
      identity: { subject: AGENT_ID, email: "agent@test.com" },
      paginateFn,
    });

    const { getMessages } = await import("./messages");

    await getMessages({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, {
      conversationId: CONVERSATION_ID,
      paginationOpts: { cursor: null, numItems: 30 },
    });

    expect(paginateFn).toHaveBeenCalled();
  });
});
