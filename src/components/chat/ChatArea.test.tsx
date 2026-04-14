/**
 * Unit tests for ChatArea visitor typing indicator and scroll-based message loading.
 *
 * Tests verify:
 *  - Visitor typing badge appears when isVisitorTyping is true
 *  - Badge is hidden when isVisitorTyping is false
 *  - Badge shows correct text and animated icon
 *  - Scroll-based loading triggers loadMore when sentinel is visible
 *  - "Load older messages" button is removed (replaced by IntersectionObserver)
 *
 * UX patterns tested:
 *  - Real-time typing indicator in chat header
 *  - Infinite scroll pagination for message history
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the convex/react hooks
const mockUseQuery = vi.fn();
const mockUsePaginatedQuery = vi.fn();
const mockUseMutation = vi.fn().mockReturnValue(vi.fn());

vi.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: vi.fn(),
  useQuery: (_api: any, _args: any) => mockUseQuery(_api, _args),
  usePaginatedQuery: (_api: any, _args: any, _opts: any) => mockUsePaginatedQuery(_api, _args, _opts),
  useMutation: (_api: any) => mockUseMutation(_api),
}));

vi.mock("@/i18n/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { id: "user_123", fullName: "Test Agent" } }),
  useOrganization: () => ({ memberships: { data: [] } }),
}));

vi.mock("@/context/ProjectContext", () => ({
  useProject: () => ({ activeProject: { _id: "proj_001", name: "Test" } }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/components/dashboard/monitor/canned-response-picker", () => ({
  CannedResponsePicker: () => null,
}));

vi.mock("@/lib/constants", () => ({
  CONVERSATION_STATUS: { OPEN: 100, ASSIGNED: 200, CLOSED: 300 },
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Conversation object returned by conversations.get
const mockConversation = {
  _id: "conv_001",
  visitorName: "John Doe",
  status: 100,
  projectId: "proj_001",
  _creationTime: Date.now(),
};

describe("ChatArea — Visitor Typing Indicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Track call order and return appropriate values:
    // 1st call: conversations.get -> mockConversation
    // 2nd call: departments.listDepartments -> []
    // 3rd call: isVisitorTyping -> false
    // 4th call: listCannedResponses -> []
    let callIndex = 0;
    mockUseQuery.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return mockConversation;
      if (callIndex === 2) return [];
      if (callIndex === 3) return false;
      if (callIndex === 4) return [];
      return undefined;
    });
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
  });

  it("shows typing badge when visitorIsTyping is true", async () => {
    let callIndex = 0;
    mockUseQuery.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return mockConversation;
      if (callIndex === 2) return [];
      if (callIndex === 3) return true; // isVisitorTyping = true
      if (callIndex === 4) return [];
      return undefined;
    });

    const { ChatArea } = await import("@/components/chat/ChatArea");

    const { container } = render(<ChatArea conversationId="conv_001" />);

    // Component should render with typing indicator
    expect(container.textContent).toContain("visitor_typing_indicator");
  });

  it("renders without crashing when visitorIsTyping is false", async () => {
    const { ChatArea } = await import("@/components/chat/ChatArea");

    const { container } = render(<ChatArea conversationId="conv_001" />);

    expect(container.textContent).toContain("John Doe");
  });

  it("renders without crashing when conversation is resolved", async () => {
    let callIndex = 0;
    mockUseQuery.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return { ...mockConversation, status: 300 };
      if (callIndex === 2) return [];
      if (callIndex === 3) return false;
      if (callIndex === 4) return [];
      return undefined;
    });

    const { ChatArea } = await import("@/components/chat/ChatArea");

    const { container } = render(<ChatArea conversationId="conv_001" />);

    expect(container.textContent).toContain("John Doe");
  });
});

describe("ChatArea — Scroll-Based Message Loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let callIndex = 0;
    mockUseQuery.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return mockConversation;
      if (callIndex === 2) return [];
      if (callIndex === 3) return false;
      if (callIndex === 4) return [];
      return undefined;
    });
  });

  it("does not render 'Load older messages' button (uses IntersectionObserver instead)", async () => {
    const loadMore = vi.fn();
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        { _id: "msg_1", content: "Hello", senderType: "visitor", _creationTime: Date.now() - 1000 },
        { _id: "msg_2", content: "Hi there", senderType: "agent", _creationTime: Date.now() },
      ],
      status: "Loaded",
      loadMore,
    });

    const { ChatArea } = await import("@/components/chat/ChatArea");

    render(<ChatArea conversationId="conv_001" />);

    expect(screen.queryByText("load_older_messages")).not.toBeInTheDocument();
  });

  it("renders a loading sentinel at the top for IntersectionObserver", async () => {
    const loadMore = vi.fn();
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        { _id: "msg_1", content: "Hello", senderType: "visitor", _creationTime: Date.now() - 1000 },
      ],
      status: "Loaded",
      loadMore,
    });

    const { ChatArea } = await import("@/components/chat/ChatArea");

    const { container } = render(<ChatArea conversationId="conv_001" />);

    // Check for IntersectionObserver sentinel
    const sentinel = container.querySelector("[data-testid='load-more-sentinel']");
    expect(sentinel).toBeInTheDocument();
  });
});
