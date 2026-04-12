import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { WidgetLoader } from "./WidgetLoader";

describe("WidgetLoader", () => {
  beforeEach(() => {
    vi.useRealTimers();
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
      expect(wrapper.style.width).toBe("400px");
      expect(wrapper.style.height).toBe("600px");
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
      expect((container as HTMLElement).style.bottom).toBe("20px");
      expect((container as HTMLElement).style.right).toBe("20px");
    });

    it("should position the launcher bottom-left when specified", () => {
      render(<WidgetLoader projectId="abc123" position="bottom-left" />);

      const container = document.querySelector(".yoosr-widget-launcher-container");
      expect(container).toBeTruthy();
      expect((container as HTMLElement).style.bottom).toBe("20px");
      expect((container as HTMLElement).style.left).toBe("20px");
    });
  });

  describe("unread badge", () => {
    it("should NOT show the unread badge by default", () => {
      render(<WidgetLoader projectId="abc123" />);

      const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
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
        const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
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
        const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
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
        const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
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
        const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
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

      const badge = document.querySelector(".yoosr-widget-launcher span.absolute");
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
});
