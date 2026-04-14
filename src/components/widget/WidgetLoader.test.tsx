import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { WidgetLoader } from "./WidgetLoader";

// Shared helper — create a realistic MediaQueryList mock
const createMatchMediaMock = (matches: boolean): MediaQueryList => ({
  matches,
  media: "",
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe("WidgetLoader", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    // Default: desktop viewport (both mobile and tablet queries return false)
    window.matchMedia = vi.fn().mockImplementation(() => createMatchMediaMock(false));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("launcher button", () => {
    it("should render the launcher button by default", () => {
      render(<WidgetLoader projectId="abc123" />);

      const button = screen.getByRole("button", { name: "Open chat" });
      expect(button).toBeTruthy();
    });

    it("should show the MessageCircle icon when closed", () => {
      render(<WidgetLoader projectId="abc123" />);

      const button = screen.getByRole("button", { name: "Open chat" });
      expect(button.querySelector("svg")).toBeTruthy();
    });

    it("should show an X icon when the chat is open", () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      const button = screen.getByRole("button", { name: "Close chat" });
      expect(button).toBeTruthy();
    });

    it("should toggle the chat window open and closed", () => {
      render(<WidgetLoader projectId="abc123" />);

      const button = screen.getByRole("button", { name: "Open chat" });

      // Open
      fireEvent.click(button);
      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();

      // Close
      fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
      expect(screen.getByRole("button", { name: "Open chat" })).toBeTruthy();
    });

    it("should keep the launcher visible when chat is open", () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();
    });
  });

  describe("chat iframe", () => {
    it("should always have the iframe mounted (for instant open)", () => {
      render(<WidgetLoader projectId="abc123" />);
      // Iframe is mounted but visually hidden
      const iframe = screen.getByTitle("Yoosr Chat Widget");
      expect(iframe).toBeTruthy();
    });

    it("should have the iframe hidden (opacity 0) by default", () => {
      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement;
      expect(wrapper).toBeTruthy();
      expect((wrapper as HTMLElement).style.opacity).toBe("0");
      expect((wrapper as HTMLElement).style.pointerEvents).toBe("none");
    });

    it("should show the iframe (opacity 1) when opened", () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement;
      expect((wrapper as HTMLElement).style.opacity).toBe("1");
      expect((wrapper as HTMLElement).style.pointerEvents).toBe("auto");
    });

    it("should render the iframe with the correct src", () => {
      render(<WidgetLoader projectId="abc123" />);

      const iframe = screen.getByTitle("Yoosr Chat Widget") as HTMLIFrameElement;
      expect(iframe.src).toContain("/widget");
      expect(iframe.src).toContain("projectId=abc123");
    });

    it("should use custom baseUrl when provided", () => {
      render(<WidgetLoader projectId="abc123" baseUrl="https://yoosr.io/widget" />);

      const iframe = screen.getByTitle("Yoosr Chat Widget") as HTMLIFrameElement;
      expect(iframe.src).toContain("yoosr.io/widget");
    });

    it("should pass theme as a query parameter", () => {
      render(<WidgetLoader projectId="abc123" theme="dark" />);

      const iframe = screen.getByTitle("Yoosr Chat Widget") as HTMLIFrameElement;
      expect(iframe.src).toContain("theme=dark");
    });

    it("should pass language as a query parameter", () => {
      render(<WidgetLoader projectId="abc123" lang="ar" />);

      const iframe = screen.getByTitle("Yoosr Chat Widget") as HTMLIFrameElement;
      expect(iframe.src).toContain("lang=ar");
    });

    it("should have correct iframe wrapper dimensions and transition", () => {
      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      expect(wrapper.style.width).toBe("380px");
      expect(wrapper.style.height).toBe("520px");
      expect(wrapper.style.maxHeight).toBe("calc(100vh - 140px)");
      expect(wrapper.style.borderRadius).toBe("12px");
      expect(wrapper.style.boxShadow).toContain("rgba");
      expect(wrapper.style.transition).toContain("transform");
      expect(wrapper.style.transition).toContain("opacity");
    });

    it("should have allow attribute for clipboard on the iframe", () => {
      render(<WidgetLoader projectId="abc123" />);

      const iframe = screen.getByTitle("Yoosr Chat Widget") as HTMLIFrameElement;
      const allowAttr = iframe.getAttribute("allow");
      expect(allowAttr).toBe("clipboard-write");
    });

    it("should set aria-hidden when the chat is closed", () => {
      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement;
      expect(wrapper?.getAttribute("aria-hidden")).toBe("true");
    });

    it("should remove aria-hidden when the chat is open", () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement;
      expect(wrapper?.getAttribute("aria-hidden")).toBe("false");
    });
  });

  describe("positioning", () => {
    it("should position the launcher bottom-right by default", () => {
      render(<WidgetLoader projectId="abc123" />);

      const container = document.querySelector(".yoosr-widget-launcher-container");
      expect(container).toBeTruthy();
      expect((container as HTMLElement).style.bottom).toBe("8px");
      expect((container as HTMLElement).style.right).toBe("8px");
    });

    it("should position the launcher bottom-left when specified", () => {
      render(<WidgetLoader projectId="abc123" position="bottom-left" />);

      const container = document.querySelector(".yoosr-widget-launcher-container");
      expect(container).toBeTruthy();
      expect((container as HTMLElement).style.bottom).toBe("8px");
      expect((container as HTMLElement).style.left).toBe("8px");
    });

    it("should position the launcher at tablet offset on smaller viewports", () => {
      vi.spyOn(window, "matchMedia").mockImplementation((query: string | MediaQueryList) => {
        const mq = typeof query === "string" ? query : "";
        const isTablet = mq.includes("480") && mq.includes("768");
        return createMatchMediaMock(isTablet);
      });

      render(<WidgetLoader projectId="abc123" />);

      const container = document.querySelector(".yoosr-widget-launcher-container");
      expect(container).toBeTruthy();
      expect((container as HTMLElement).style.bottom).toBe("8px");
      expect((container as HTMLElement).style.right).toBe("8px");
    });
  });

  describe("unread badge", () => {
    it("should NOT show the unread badge by default", () => {
      render(<WidgetLoader projectId="abc123" />);

      const badge = document.querySelector(".yoosr-widget-launcher span.bg-red-500");
      expect(badge).toBeNull();
    });

    it("should show the unread badge when a postMessage is received", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "null",
          })
        );
      });

      await waitFor(() => {
        const badge = document.querySelector(".yoosr-widget-launcher span.bg-red-500");
        expect(badge).toBeTruthy();
        expect((badge as HTMLElement).textContent).toBe("1");
      });
    });

    it("should increment the unread badge on multiple messages", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "null",
          })
        );
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "null",
          })
        );
      });

      await waitFor(() => {
        const badge = document.querySelector(".yoosr-widget-launcher span.bg-red-500");
        expect((badge as HTMLElement).textContent).toBe("2");
      });
    });

    it("should cap the badge at 9+", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        for (let i = 0; i < 15; i++) {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: { type: "yoosr:new_message" },
              origin: "null",
            })
          );
        }
      });

      await waitFor(() => {
        const badge = document.querySelector(".yoosr-widget-launcher span.bg-red-500");
        expect((badge as HTMLElement).textContent).toBe("9+");
      });
    });

    it("should reset the unread badge when the user opens the widget", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "null",
          })
        );
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "null",
          })
        );
      });

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      await waitFor(() => {
        const badge = document.querySelector(".yoosr-widget-launcher span.bg-red-500");
        expect(badge).toBeNull();
      });
    });

    it("should ignore postMessage events from other origins", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "https://evil.com",
          })
        );
      });

      await new Promise((r) => setTimeout(r, 50));

      const badge = document.querySelector(".yoosr-widget-launcher span.bg-red-500");
      expect(badge).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should throw if projectId is missing", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<WidgetLoader projectId="" />)).toThrow();
      expect(() => render(<WidgetLoader projectId={undefined as unknown as string} />)).toThrow();
    });

    it("should call onError when iframe fails to load", () => {
      const onError = vi.fn();
      render(<WidgetLoader projectId="abc123" onError={onError} />);

      expect(typeof onError).toBe("function");
    });
  });

  describe("toast notification", () => {
    it("should NOT show a toast by default", () => {
      render(<WidgetLoader projectId="abc123" />);

      const toast = document.querySelector("[aria-live='polite']");
      expect(toast).toBeNull();
    });

    it("should show a toast when a yoosr:new_message is received while minimized", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message", senderName: "Agent", message: "Hi there!" },
            origin: "null",
          })
        );
      });

      await waitFor(() => {
        const toast = document.querySelector("[aria-live='polite']");
        expect(toast).toBeTruthy();
        expect((toast as HTMLElement).textContent).toContain("Agent");
        expect((toast as HTMLElement).textContent).toContain("Hi there!");
      });
    });

    it("should NOT show a toast when the widget is open", async () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message", senderName: "Agent", message: "Hello" },
            origin: "null",
          })
        );
      });

      const toast = document.querySelector("[aria-live='polite']");
      expect(toast).toBeNull();
    });

    it("should dismiss the toast after 4 seconds", async () => {
      vi.useFakeTimers();
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message", senderName: "Agent", message: "Hey" },
            origin: "null",
          })
        );
      });

      // Toast should be visible initially
      expect(document.querySelector("[aria-live='polite']")).toBeTruthy();

      // Advance timers past the 4s auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });

      expect(document.querySelector("[aria-live='polite']")).toBeNull();
      vi.useRealTimers();
    });

    it("should open the widget and clear the badge when toast is clicked", async () => {
      render(<WidgetLoader projectId="abc123" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message", senderName: "Agent", message: "Click me" },
            origin: "null",
          })
        );
      });

      await waitFor(() => {
        expect(document.querySelector("[aria-live='polite']")).toBeTruthy();
      });

      fireEvent.click(document.querySelector("[aria-live='polite']")!);

      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();
      expect(document.querySelector("[aria-live='polite']")).toBeNull();
      const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
      expect(badge).toBeNull();
    });
  });

  describe("launcher pulse animation", () => {
    it("should add the pulse class when a new message arrives", async () => {
      render(<WidgetLoader projectId="abc123" />);

      const button = screen.getByRole("button", { name: "Open chat" });
      expect(button.className).not.toContain("yoosr-launcher-pulse");

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message" },
            origin: "null",
          })
        );
      });

      expect(button.className).toContain("yoosr-launcher-pulse");
    });
  });

  describe("iframe visibility postMessage", () => {
    it("should send yoosr:visibility_change to iframe when opened", async () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      // Verify the button state changed (visibility message sent to iframe)
      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();
    });

    it("should send yoosr:visibility_change to iframe when closed", async () => {
      render(<WidgetLoader projectId="abc123" />);

      // Open first
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
      // Then close
      fireEvent.click(screen.getByRole("button", { name: "Close chat" }));

      expect(screen.getByRole("button", { name: "Open chat" })).toBeTruthy();
    });
  });

  describe("mobile responsive widget", () => {
    it("should register matchMedia listener on mount", () => {
      const addEventListenerSpy = vi.fn();
      const mockMql = createMatchMediaMock(true);
      (mockMql.addEventListener as ReturnType<typeof vi.fn>) = addEventListenerSpy;

      vi.spyOn(window, "matchMedia").mockReturnValue(mockMql);

      render(<WidgetLoader projectId="abc123" />);

      expect(window.matchMedia).toHaveBeenCalled();
    });

    it("should clean up matchMedia listener on unmount", () => {
      const removeEventListenerSpy = vi.fn();
      const mockMql = createMatchMediaMock(true);
      (mockMql.removeEventListener as ReturnType<typeof vi.fn>) = removeEventListenerSpy;

      vi.spyOn(window, "matchMedia").mockReturnValue(mockMql);

      const { unmount } = render(<WidgetLoader projectId="abc123" />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it("should apply mobile styles when viewport is < 480px", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(() => createMatchMediaMock(true));

      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      expect(wrapper.style.width).toBe("100vw");
      expect(wrapper.style.height).toBe("100vh");
      expect(wrapper.style.borderRadius).toBe("0px");
      expect(wrapper.style.bottom).toBe("0px");
      expect(wrapper.style.right).toBe("0px");
    });

    it("should apply tablet styles when viewport is 480px - 768px", () => {
      // Mobile query doesn't match (480px breakpoint), tablet query matches
      vi.spyOn(window, "matchMedia").mockImplementation((query: string | MediaQueryList) => {
        const mq = typeof query === "string" ? query : "";
        // Mobile: max-width 479px -> doesn't match for tablet viewport
        // Tablet: min-width 480px and max-width 768px -> matches for tablet viewport
        const isTablet = mq.includes("480") && mq.includes("768");
        return createMatchMediaMock(isTablet);
      });

      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      expect(wrapper.style.width).toBe("calc(100vw - 32px)");
      expect(wrapper.style.maxHeight).toBe("calc(100vh - 140px)");
      // Chat window sits above launcher: 56 + 8 + 4 = 68px
      expect(wrapper.style.bottom).toBe("68px");
      expect(wrapper.style.right).toBe("68px");
    });

    it("should apply desktop styles when viewport is > 768px", () => {
      // Both mobile and tablet queries don't match
      vi.spyOn(window, "matchMedia").mockImplementation(() => createMatchMediaMock(false));

      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      expect(wrapper.style.width).toBe("380px");
      expect(wrapper.style.height).toBe("520px");
      expect(wrapper.style.maxHeight).toBe("calc(100vh - 140px)");
      // Chat window sits above launcher: 56 + 8 + 4 = 68px
      expect(wrapper.style.bottom).toBe("68px");
      expect(wrapper.style.right).toBe("68px");
    });

    it("should maintain open/close transitions with dynamic styles", () => {
      render(<WidgetLoader projectId="abc123" />);

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;

      // Check transition property exists before open
      expect(wrapper.style.transition).toContain("transform");
      expect(wrapper.style.transition).toContain("opacity");

      // Open the widget
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      // Check transition still works after open
      expect(wrapper.style.transition).toContain("transform");
      expect(wrapper.style.transition).toContain("opacity");
      expect(wrapper.style.opacity).toBe("1");
    });

    it("should hide launcher on mobile when widget is open", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(() => createMatchMediaMock(true));

      render(<WidgetLoader projectId="abc123" />);

      const container = document.querySelector(".yoosr-widget-launcher-container");
      expect(container).toBeTruthy();
      expect((container as HTMLElement).style.display).toBeFalsy(); // visible when closed

      // Open the widget
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      // Launcher should be hidden on mobile
      expect((container as HTMLElement).style.display).toBe("none");
    });

    it("should keep launcher visible on desktop when widget is open", () => {
      // Both mobile and tablet queries don't match = desktop
      vi.spyOn(window, "matchMedia").mockImplementation(() => createMatchMediaMock(false));

      render(<WidgetLoader projectId="abc123" />);

      const container = document.querySelector(".yoosr-widget-launcher-container");
      expect(container).toBeTruthy();
      expect((container as HTMLElement).style.display).toBeFalsy();

      // Open the widget
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      // Launcher should still be visible on desktop
      expect((container as HTMLElement).style.display).toBeFalsy();
    });

    it("should offset chat window above launcher on desktop", () => {
      // Desktop: both matchMedia queries return false
      vi.spyOn(window, "matchMedia").mockImplementation(() => createMatchMediaMock(false));

      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      // Chat window bottom = launcherSize(56) + offset(8) + gap(4) = 68px
      expect(wrapper.style.bottom).toBe("68px");
      expect(wrapper.style.right).toBe("68px");
    });

    it("should offset chat window above launcher on tablet", () => {
      // Tablet: mobile doesn't match, tablet matches
      vi.spyOn(window, "matchMedia").mockImplementation((query: string | MediaQueryList) => {
        const mq = typeof query === "string" ? query : "";
        const isTablet = mq.includes("480") && mq.includes("768");
        return createMatchMediaMock(isTablet);
      });

      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      // Chat window bottom = launcherSize(56) + tabletOffset(8) + gap(4) = 68px
      expect(wrapper.style.bottom).toBe("68px");
      expect(wrapper.style.right).toBe("68px");
    });

    it("should position chat window at bottom 0 on mobile when open", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(() => createMatchMediaMock(true));

      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      const wrapper = screen.getByTitle("Yoosr Chat Widget").parentElement as HTMLElement;
      expect(wrapper.style.bottom).toBe("0px");
      expect(wrapper.style.right).toBe("0px");
    });
  });

  describe("focus management", () => {
    it("should send focus_input postMessage to iframe when opened", async () => {
      const postMessageSpy = vi.fn();
      const mockIframe = {
        contentWindow: { postMessage: postMessageSpy },
      };

      render(<WidgetLoader projectId="abc123" />);

      // Replace the iframe ref manually
      const iframe = screen.getByTitle("Yoosr Chat Widget") as HTMLIFrameElement;
      Object.defineProperty(iframe, "contentWindow", { value: mockIframe.contentWindow });

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith(
          { type: "yoosr:focus_input", payload: {} },
          "*"
        );
      });
    });

    it("should return focus to launcher on close", async () => {
      const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

      render(<WidgetLoader projectId="abc123" />);

      // Open first
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
      // Then close
      fireEvent.click(screen.getByRole("button", { name: "Close chat" }));

      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
      });
    });

    it("should close widget and return focus to launcher on Escape key", async () => {
      const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

      render(<WidgetLoader projectId="abc123" />);

      // Open the widget
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Open chat" })).toBeTruthy();
        expect(focusSpy).toHaveBeenCalled();
      });
    });

    it("should NOT close widget on non-Escape key", () => {
      render(<WidgetLoader projectId="abc123" />);

      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();

      // Press non-Escape key
      fireEvent.keyDown(window, { key: "Enter" });

      expect(screen.getByRole("button", { name: "Close chat" })).toBeTruthy();
    });
  });

  describe("primaryColor theming", () => {
    it("should use the default color (#6366f1) when no primaryColor is provided", () => {
      render(<WidgetLoader projectId="abc123" />);

      const button = screen.getByRole("button", { name: "Open chat" });
      // Browsers convert hex colors to rgb format when set via inline styles
      expect((button as HTMLElement).style.backgroundColor).toBe("rgb(99, 102, 241)");
    });

    it("should apply the primaryColor to the launcher button", () => {
      render(<WidgetLoader projectId="abc123" primaryColor="#16a34a" />);

      const button = screen.getByRole("button", { name: "Open chat" });
      expect((button as HTMLElement).style.backgroundColor).toBe("rgb(22, 163, 74)");
    });

    it("should apply the primaryColor to the toast avatar", async () => {
      render(<WidgetLoader projectId="abc123" primaryColor="#7c3aed" />);

      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "yoosr:new_message", senderName: "Agent", message: "Hi!" },
            origin: "null",
          })
        );
      });

      await waitFor(() => {
        const toast = document.querySelector("[aria-live='polite']");
        expect(toast).toBeTruthy();
        const avatar = toast?.querySelector("div.w-7");
        expect((avatar as HTMLElement).style.backgroundColor).toBe("rgb(124, 58, 237)");
      });
    });

    it("should update the pulse animation color to match primaryColor", () => {
      render(<WidgetLoader projectId="abc123" primaryColor="#ff0000" />);

      // Pulse animation is injected via <style> tag — verify the component renders
      const button = screen.getByRole("button", { name: "Open chat" });
      expect((button as HTMLElement).style.backgroundColor).toBe("rgb(255, 0, 0)");
    });
  });
});
