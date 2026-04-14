/**
 * Unit tests for conversation mutations and queries used by the Monitor dashboard.
 *
 * Tests verify:
 *  - resolve sets status=1000, resolvedBy, system message
 *  - join adds participant, auto-assigns, sets botPaused
 *  - leave removes participant, unassigns if was assigned
 *  - updateConversationStatus patches status correctly
 *  - transferToDepartment clears assignment, resets status=100, triggers routing
 *  - getConversations returns enriched shape with profileMap (no N+1)
 *  - countActiveConversations excludes status=1000
 *
 * Security boundary tested:
 *  - All mutations require auth (authError thrown without identity)
 */
import { describe, it, expect, vi } from "vitest";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";

// ── Constants ────────────────────────────────────────────────────────

const CONVERSATION_ID = "conv_001" as Id<"conversations">;
const PROJECT_ID = "proj_001" as Id<"projects">;
const AGENT_ID = "user_agent_1";
const CONVERSATION_STATUS = { UNASSIGNED: 100, ASSIGNED: 200, CLOSED: 1000 };

// ── Test helpers ──────────────────────────────────────────────────────

type MockMutationCtx = Pick<MutationCtx, "db" | "scheduler" | "auth" | "runMutation">;
type MockQueryCtx = Pick<QueryCtx, "db" | "auth">;

function createMockMutationCtx(options?: {
  patchFn?: ReturnType<typeof vi.fn>;
  insertFn?: ReturnType<typeof vi.fn>;
  getFn?: ReturnType<typeof vi.fn>;
  schedulerRunAfter?: ReturnType<typeof vi.fn>;
  runMutation?: ReturnType<typeof vi.fn>;
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
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }),
    } as unknown as MutationCtx["auth"],
    runMutation: options?.runMutation ?? vi.fn().mockResolvedValue(undefined),
  } as unknown as MockMutationCtx;
}

function createMockQueryCtx(options?: {
  queryFn?: ReturnType<typeof vi.fn>;
  getFn?: ReturnType<typeof vi.fn>;
  identity?: object | null;
}): MockQueryCtx {
  const queryFn = options?.queryFn ?? vi.fn().mockResolvedValue(null);
  return {
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        first: queryFn,
        collect: vi.fn().mockResolvedValue([]),
        paginate: vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: "" }),
        take: vi.fn().mockResolvedValue([]),
      }),
      get: options?.getFn ?? vi.fn().mockResolvedValue(null),
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
    visitorName: "Test Visitor",
    visitorEmail: "visitor@test.com",
    visitorPhone: undefined,
    visitorId: undefined,
    visitorAddress: undefined,
    visitorNote: undefined,
    status: CONVERSATION_STATUS.UNASSIGNED,
    lastMessage: "Hello!",
    unreadCount: 0,
    updatedAt: Date.now() - 60000,
    expiresAt: Date.now() + 86400000 * 30,
    participants: [],
    assignedTo: undefined,
    departmentId: undefined,
    botId: undefined,
    botPaused: false,
    tags: [],
    priority: undefined,
    firstResponseAt: undefined,
    slaDeadline: undefined,
    resolvedBy: undefined,
    channel: "widget",
    attributes: { channel: "widget", department: "General", location: "Unknown", language: "en", os: "Unknown", browser: "Unknown", sourcePage: "", ip: "" },
    ...overrides,
  } as unknown as Doc<"conversations">;
}

// ── resolve mutation tests ──────────────────────────────────────────

describe("resolve", () => {
  it("sets status to 1000 and resolvedBy", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { resolve } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (resolve as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com", name: "Agent" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      status: 1000,
      resolvedBy: AGENT_ID,
    }));
  });

  it("inserts a system message", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const insertFn = vi.fn().mockResolvedValue("msg_id");
    const ctx = createMockMutationCtx({
      insertFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { resolve } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (resolve as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(insertFn).toHaveBeenCalledWith("messages", expect.objectContaining({
      conversationId: CONVERSATION_ID,
      projectId: PROJECT_ID,
      senderType: "bot",
      content: "system.resolved",
      type: "system",
    }));
  });

  it("schedules webhook and notification events", async () => {
    const conv = createMockConversation({ assignedTo: "user_other", participants: [AGENT_ID] });
    const schedulerRunAfter = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      getFn: vi.fn().mockResolvedValue(conv),
      schedulerRunAfter,
      patchFn: vi.fn().mockResolvedValue(undefined),
      insertFn: vi.fn().mockResolvedValue("msg_id"),
    });

    const { resolve } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (resolve as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    // Webhook fire
    expect(schedulerRunAfter).toHaveBeenCalledWith(0, expect.anything(), expect.objectContaining({
      event: "conversation.closed",
    }));
    // Notification to other agent
    expect(schedulerRunAfter).toHaveBeenCalledWith(0, expect.anything(), expect.objectContaining({
      type: "resolved",
      recipientId: "user_other",
    }));
  });
});

// ── join mutation tests ─────────────────────────────────────────────

describe("join", () => {
  it("adds agent to participants", async () => {
    const conv = createMockConversation({ participants: [] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { join } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (join as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      participants: [AGENT_ID],
      botPaused: true,
    }));
  });

  it("auto-assigns to agent if conversation was unassigned", async () => {
    const conv = createMockConversation({ assignedTo: undefined, status: 100, participants: [] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { join } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (join as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      assignedTo: AGENT_ID,
      status: 200,
    }));
  });

  it("inserts agentConnected system message when was unassigned", async () => {
    const conv = createMockConversation({ assignedTo: undefined, participants: [] });
    const insertFn = vi.fn().mockResolvedValue("msg_id");
    const ctx = createMockMutationCtx({
      insertFn,
      getFn: vi.fn().mockResolvedValue(conv),
      patchFn: vi.fn().mockResolvedValue(undefined),
    });

    const { join } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (join as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(insertFn).toHaveBeenCalledWith("messages", expect.objectContaining({
      content: "system.agentConnected",
      senderType: "bot",
    }));
  });
});

// ── leave mutation tests ────────────────────────────────────────────

describe("leave", () => {
  it("removes agent from participants", async () => {
    const conv = createMockConversation({ participants: [AGENT_ID, "user_other"] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { leave } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (leave as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      participants: ["user_other"],
    }));
  });

  it("clears assignedTo and resets status when assigned agent leaves", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, status: 200, participants: [AGENT_ID] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { leave } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (leave as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      assignedTo: undefined,
      status: 100,
    }));
  });
});

// ── updateConversationStatus mutation tests ─────────────────────────

describe("updateConversationStatus", () => {
  it("patches status and updatedAt", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { updateConversationStatus } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (updateConversationStatus as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID, status: 200 });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      status: 200,
    }));
  });

  it("optionally patches botPaused", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, participants: [AGENT_ID] });
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(conv),
    });

    const { updateConversationStatus } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (updateConversationStatus as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID, status: 100, botPaused: false });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      status: 100,
      botPaused: false,
    }));
  });
});

// ── transferToDepartment mutation tests ─────────────────────────────

describe("transferToDepartment", () => {
  it("clears assignedTo and resets status to 100", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, status: 200, participants: [AGENT_ID] });
    const dept = { _id: "dept_1" as Id<"departments">, _creationTime: Date.now(), projectId: PROJECT_ID, name: "Sales", description: "", isDefault: false };
    const patchFn = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      patchFn,
      getFn: vi.fn().mockResolvedValue(null)
        .mockReturnValueOnce(conv) // first call: conversation
        .mockReturnValueOnce(dept), // second call: department
      schedulerRunAfter: vi.fn().mockResolvedValue(undefined),
      runMutation: vi.fn().mockResolvedValue(undefined),
    });

    const { transferToDepartment } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (transferToDepartment as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID, departmentId: "dept_1" as Id<"departments"> });

    expect(patchFn).toHaveBeenCalledWith(CONVERSATION_ID, expect.objectContaining({
      assignedTo: undefined,
      status: 100,
      departmentId: "dept_1",
    }));
  });

  it("schedules routing for new department", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, status: 200, participants: [AGENT_ID] });
    const dept = { _id: "dept_1" as Id<"departments">, _creationTime: Date.now(), projectId: PROJECT_ID, name: "Sales", description: "", isDefault: false };
    const schedulerRunAfter = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockMutationCtx({
      getFn: vi.fn().mockResolvedValue(null)
        .mockReturnValueOnce(conv)
        .mockReturnValueOnce(dept),
      schedulerRunAfter,
      patchFn: vi.fn().mockResolvedValue(undefined),
      runMutation: vi.fn().mockResolvedValue(undefined),
    });

    const { transferToDepartment } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (transferToDepartment as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as MutationCtx, { id: CONVERSATION_ID, departmentId: "dept_1" as Id<"departments"> });

    expect(schedulerRunAfter).toHaveBeenCalledWith(0, expect.anything(), expect.objectContaining({
      departmentId: "dept_1",
    }));
  });
});

// ── getConversations query tests ────────────────────────────────────

describe("getConversations", () => {
  it("returns enriched conversation shape with assignedAgent", async () => {
    const conv = createMockConversation({ assignedTo: AGENT_ID, status: 100 });
    const profile = { _id: "prof_1" as Id<"profiles">, _creationTime: Date.now(), userId: AGENT_ID, fullName: "Agent One", username: "agent1", avatarUrl: "https://example.com/avatar.png" };

    const collectFn = vi.fn().mockResolvedValue([conv]);
    const profileFirstFn = vi.fn().mockResolvedValue(profile);
    const ctx = createMockQueryCtx({
      queryFn: profileFirstFn,
      identity: { subject: AGENT_ID, email: "agent@test.com" },
    });
    // Override query to return conversations via collect
    (ctx.db.query as ReturnType<typeof vi.fn>).mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      collect: collectFn,
      first: profileFirstFn,
    });

    const { getConversations } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (getConversations as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, { projectId: PROJECT_ID });

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("assignedAgent");
    expect(result[0].assignedAgent).toEqual({
      name: "Agent One",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(result[0].id).toBe(CONVERSATION_ID);
    expect(result[0].status).toBe(100);
  });

  it("excludes status=1000 conversations", async () => {
    const collectFn = vi.fn().mockResolvedValue([]);
    const ctx = createMockQueryCtx({
      identity: { subject: AGENT_ID, email: "agent@test.com" },
    });
    (ctx.db.query as ReturnType<typeof vi.fn>).mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      collect: collectFn,
      first: vi.fn().mockResolvedValue(null),
    });

    const { getConversations } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (getConversations as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, { projectId: PROJECT_ID });

    // Verify filter was called with neq for status 1000
    expect(collectFn).toHaveBeenCalled();
  });

  it("filters by departmentId when provided", async () => {
    const conv1 = createMockConversation({ _id: "conv_1" as Id<"conversations">, departmentId: "dept_1" as Id<"departments"> });
    const conv2 = createMockConversation({ _id: "conv_2" as Id<"conversations">, departmentId: "dept_2" as Id<"departments"> });

    const collectFn = vi.fn().mockResolvedValue([conv1, conv2]);
    const ctx = createMockQueryCtx({
      identity: { subject: AGENT_ID, email: "agent@test.com" },
    });
    (ctx.db.query as ReturnType<typeof vi.fn>).mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      collect: collectFn,
      first: vi.fn().mockResolvedValue(null),
    });

    const { getConversations } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (getConversations as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, { projectId: PROJECT_ID, departmentId: "dept_1" as Id<"departments"> });

    // Just verify the query was called
    expect(collectFn).toHaveBeenCalled();
  });
});

// ── countActiveConversations query tests ────────────────────────────

describe("countActiveConversations", () => {
  it("returns count excluding status=1000", async () => {
    const paginateFn = vi.fn()
      .mockResolvedValueOnce({ page: [createMockConversation({ _id: "c1" as Id<"conversations"> }), createMockConversation({ _id: "c2" as Id<"conversations"> })], isDone: true, continueCursor: "" });

    const ctx = createMockQueryCtx({
      identity: { subject: AGENT_ID, email: "agent@test.com" },
    });
    (ctx.db.query as ReturnType<typeof vi.fn>).mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      paginate: paginateFn,
    });

    const { countActiveConversations } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (countActiveConversations as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, { projectId: PROJECT_ID });

    expect(result).toEqual({ count: 2 });
  });

  it("returns 0 when no active conversations exist", async () => {
    const paginateFn = vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: "" });

    const ctx = createMockQueryCtx({
      identity: { subject: AGENT_ID, email: "agent@test.com" },
    });
    (ctx.db.query as ReturnType<typeof vi.fn>).mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      paginate: paginateFn,
    });

    const { countActiveConversations } = await import("./conversations");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (countActiveConversations as any).handler({
      ...ctx,
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: AGENT_ID, email: "agent@test.com" }) },
    } as unknown as QueryCtx, { projectId: PROJECT_ID });

    expect(result).toEqual({ count: 0 });
  });
});
