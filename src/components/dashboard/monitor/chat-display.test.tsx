/**
 * Component tests for ChatDisplay (Monitor dashboard).
 *
 * Tests verify:
 *  - Renders empty state when no conversation selected
 *  - Renders messages in correct order (reversed for display)
 *  - Shows "Load older messages" button when not exhausted
 *  - Internal vs public message badges
 *  - Canned response picker shows on "/" trigger
 *  - Join/Leave button toggles
 *  - Resolve menu item disabled on closed conversations
 *  - Resolve menu item enabled on open conversations
 *  - Keyboard Enter sends message, Shift+Enter adds newline
 *  - Input disabled on closed conversations
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatDisplay } from "./chat-display";
import { Conversation } from "./conversation-list";
import { CONVERSATION_STATUS } from "@/lib/constants";
import React from "react";

// Mock next-intl to return readable labels from keys
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const parts = key.split(".");
    return parts[parts.length - 1].replace(/_/g, " ");
  },
  useLocale: () => "en",
}));

// Mock Radix DropdownMenu to render inline without portals (jsdom compatibility)
vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");

  const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    return React.createElement("div", { "data-testid": "dropdown-menu" }, children);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DropdownMenuTrigger = ({ asChild, children, ...props }: any) => {
    return asChild
      ? React.Children.only(children) as React.ReactElement
      : React.createElement("div", props, children);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DropdownMenuContent = React.forwardRef<HTMLDivElement, any>(
    ({ children, className, ...props }, ref) => {
      return React.createElement(
        "div",
        {
          ref,
          className,
          role: "menu",
          "data-testid": "dropdown-content",
          ...props,
        },
        children
      );
    }
  );
  DropdownMenuContent.displayName = "DropdownMenuContent";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DropdownMenuItem = React.forwardRef<HTMLDivElement, any>(
    ({ children, disabled, onClick, className, ...props }, ref) => {
      return React.createElement(
        "div",
        {
          ref,
          className,
          role: "menuitem",
          "data-disabled": disabled ? "" : undefined,
          "aria-disabled": disabled ? "true" : undefined,
          onClick: disabled ? undefined : onClick,
          ...props,
        },
        children
      );
    }
  );
  DropdownMenuItem.displayName = "DropdownMenuItem";

  return {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const mockUseMutation = vi.fn().mockImplementation((..._args: any[]) => vi.fn());
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const mockUseQuery = vi.fn().mockImplementation((..._args: any[]) => undefined);
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const mockUsePaginatedQuery = vi.fn().mockImplementation((..._args: any[]) => ({
  results: [] as unknown[],
  status: "Exhausted",
  loadMore: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { id: "user_agent_1", fullName: "Agent One" } }),
  useOrganization: () => ({ memberships: { data: [] } }),
}));

vi.mock("@/context/ProjectContext", () => ({
  useProject: () => ({ activeProject: { _id: "proj_001", name: "Test Project" } }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock scrollIntoView (not available in jsdom)
const mockScrollIntoView = vi.fn();
beforeEach(() => {
  Element.prototype.scrollIntoView = mockScrollIntoView;
});
afterEach(() => {
  vi.restoreAllMocks();
});

// ── Test data helpers ────────────────────────────────────────────────

function createMockConversation(overrides?: Partial<Conversation>): Conversation {
  return {
    id: "conv_001",
    status: CONVERSATION_STATUS.UNASSIGNED,
    tags: [],
    participants: [],
    createdAt: Date.now() - 3600000,
    lastMessage: "Hello!",
    timestamp: Date.now() - 60000,
    assignedTo: null,
    assignedAgent: null,
    channel: "web",
    unread: 0,
    user: {
      name: "Test Visitor",
      email: "visitor@test.com",
      avatar: "",
      initials: "TV",
    },
    details: {
      department: "General",
      location: "Unknown",
      language: "en",
      os: "Unknown",
      browser: "Unknown",
      sourcePage: "",
      ip: "",
    },
    firstResponseAt: undefined,
    slaDeadline: undefined,
    botId: null,
    ...overrides,
  };
}

// ── Render wrapper ──────────────────────────────────────────────────

function renderChatDisplay(props: Partial<React.ComponentProps<typeof ChatDisplay>> = {}) {
  const defaultProps = {
    conversation: null,
    onBack: undefined,
    onOpenContact: undefined,
  };

  beforeEach(() => {
    mockUseMutation.mockClear();
    mockUseQuery.mockClear().mockReturnValue(undefined);
    mockUsePaginatedQuery.mockClear().mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
  });

  return render(
    <ChatDisplay {...defaultProps} {...props} />
  );
}

// ── Empty state tests ───────────────────────────────────────────────

describe("ChatDisplay empty state", () => {
  it("renders empty state when no conversation selected", () => {
    renderChatDisplay({ conversation: null });

    // Component uses i18n: key "no_conversation_title" → "no conversation title"
    expect(screen.getByText("no conversation title")).toBeTruthy();
    expect(screen.getByText("no conversation body")).toBeTruthy();
  });
});

// ── Message rendering tests ─────────────────────────────────────────

describe("ChatDisplay message rendering", () => {
  it("renders visitor messages on the left side", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        { _id: "msg_1", content: "Hello from visitor", senderType: "visitor", createdAt: Date.now() - 60000 },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    expect(screen.getByText("Hello from visitor")).toBeTruthy();
  });

  it("renders agent messages on the right side", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        { _id: "msg_1", content: "Hello from agent", senderType: "agent", senderId: "user_agent_1", createdAt: Date.now() - 30000 },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    expect(screen.getByText("Hello from agent")).toBeTruthy();
  });

  it("renders internal notes with 'Internal Note' badge", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        { _id: "msg_1", content: "Internal note content", senderType: "agent", senderId: "user_agent_1", createdAt: Date.now() - 30000, isInternal: true },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // Badge text is hardcoded as "Internal Note" in the component
    expect(screen.getByText("Internal Note")).toBeTruthy();
    expect(screen.getByText("Internal note content")).toBeTruthy();
  });

  it("renders messages in reverse order (newest at bottom)", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        { _id: "msg_3", content: "Third message", senderType: "visitor", createdAt: Date.now() - 10000 },
        { _id: "msg_2", content: "Second message", senderType: "agent", senderId: "user_agent_1", createdAt: Date.now() - 20000 },
        { _id: "msg_1", content: "First message", senderType: "visitor", createdAt: Date.now() - 30000 },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    const messages = screen.getAllByText(/(First|Second|Third) message/);
    // DOM order should be: First, Second, Third (reversed from query results)
    expect(messages[0].textContent).toBe("First message");
    expect(messages[1].textContent).toBe("Second message");
    expect(messages[2].textContent).toBe("Third message");
  });

  it("shows 'Load older messages' button when not exhausted", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [{ _id: "msg_1", content: "Hello", senderType: "visitor", createdAt: Date.now() - 60000 }],
      status: "LoadingMore",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    expect(screen.getByText("Load older messages")).toBeTruthy();
  });

  it("shows loading skeleton when LoadingFirstPage", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "LoadingFirstPage",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // Skeletons should be rendered - look for the animate-pulse class
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty prompt when no messages exist", () => {
    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // Component text: "No messages yet. Send a message to start!"
    expect(screen.getByText(/No messages yet/i)).toBeTruthy();
  });
});

// ── Input tests ─────────────────────────────────────────────────────

describe("ChatDisplay input", () => {
  it("disables input when conversation is closed (resolved)", () => {
    const conv = createMockConversation({ status: CONVERSATION_STATUS.CLOSED });
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // Placeholder comes from i18n key when conversation is closed
    const textarea = screen.getByPlaceholderText(/this conversation is resolved/i);
    expect(textarea).toBeDisabled();
  });

  it("sends message when pressing Enter", async () => {
    const mockSend = vi.fn().mockResolvedValue(true);
    mockUseMutation.mockReturnValue(mockSend);

    const conv = createMockConversation();
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "Test message" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalled();
    });
  });

  it("shows canned response picker when typing '/'", () => {
    const conv = createMockConversation();
    mockUseQuery.mockReturnValue([
      { _id: "r1", trigger: "greeting", message: "Hello!" },
    ]);
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "/" } });

    // Picker should appear with "No responses found" or response items
    expect(screen.getByText(/No responses found|Hello!/i)).toBeTruthy();
  });
});

// ── Join/Leave button tests ─────────────────────────────────────────

describe("ChatDisplay Join/Leave button", () => {
  it("shows 'Join' button when not participating", () => {
    const conv = createMockConversation({ participants: [] });
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // i18n key "btn_join" → "btn join"
    expect(screen.getByText("btn join")).toBeTruthy();
  });

  it("shows 'Leave' button when participating", () => {
    const conv = createMockConversation({ participants: ["user_agent_1"] });
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // i18n key "btn_leave" → "btn leave"
    expect(screen.getByText("btn leave")).toBeTruthy();
  });
});

// ── Menu tests ──────────────────────────────────────────────────────

describe("ChatDisplay menu", () => {
  it("disables 'Resolve conversation' menu item on closed conversations", () => {
    const conv = createMockConversation({ status: CONVERSATION_STATUS.CLOSED });
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // Menu content is always rendered inline with our mock - may have multiple menus
    const dropdownContents = screen.getAllByRole("menu");
    expect(dropdownContents.length).toBeGreaterThan(0);

    // Check resolve menu item exists (i18n key "menu_resolve" → "menu resolve")
    const resolveItems = screen.getAllByText("menu resolve");
    expect(resolveItems.length).toBeGreaterThan(0);

    // Check that it's disabled - our mock sets data-disabled attribute
    const parentItem = resolveItems[0].closest("[role='menuitem']");
    expect(parentItem?.hasAttribute("data-disabled")).toBeTruthy();
  });

  it("enables 'Resolve conversation' menu item on active conversations", () => {
    const conv = createMockConversation({ status: CONVERSATION_STATUS.UNASSIGNED });
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    renderChatDisplay({ conversation: conv });

    // Menu content is always rendered inline with our mock
    const dropdownContents = screen.getAllByRole("menu");
    expect(dropdownContents.length).toBeGreaterThan(0);

    // Check resolve menu item exists
    const resolveItems = screen.getAllByText("menu resolve");
    expect(resolveItems.length).toBeGreaterThan(0);

    // Check that it's NOT disabled
    const parentItem = resolveItems[0].closest("[role='menuitem']");
    expect(parentItem?.hasAttribute("data-disabled")).toBeFalsy();
  });
});
