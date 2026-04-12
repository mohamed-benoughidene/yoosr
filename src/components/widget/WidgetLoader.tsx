"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { buildWidgetIframeSrc } from "@/lib/widget-loader";
import { MessageCircle, X } from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

export interface WidgetLoaderProps {
  /** The project identifier for this widget instance */
  projectId: string;
  /** Full base URL for the widget route. Defaults to "/widget" (origin-relative) */
  baseUrl?: string;
  /** Widget position on the page */
  position?: "bottom-right" | "bottom-left";
  /** UI theme override */
  theme?: string;
  /** Language locale override */
  lang?: string;
  /** Text direction override */
  dir?: "ltr" | "rtl";
  /** Called when the iframe finishes loading successfully */
  onLoad?: () => void;
  /** Called when the iframe fails to load */
  onError?: (error: Error) => void;
}

// ── Constants ───────────────────────────────────────────────────────────────

const IFRAME_WIDTH = 400;
const IFRAME_HEIGHT = 600;
const IFRAME_Z_INDEX = 9999;
const OFFSET = 20;
const LAUNCHER_SIZE = 56;
const UNREAD_BADGE_SIZE = 20;
const CHAT_BOTTOM_OFFSET = OFFSET + LAUNCHER_SIZE + 8;

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Renders the Yoosr chat widget following industry-standard UX patterns
 * (Intercom, Drift, Zendesk):
 *
 * - Launcher button **stays visible** when chat is open
 * - Chat opens as a popover panel above the launcher
 * - Unread message badge on the launcher
 * - Clicking the launcher toggles the chat window
 *
 * Performance: The iframe is mounted once and kept alive.
 * Toggle uses CSS `transform` + `opacity` (GPU-accelerated)
 * for instant open/close without reloading the widget.
 */
export function WidgetLoader({
  projectId,
  baseUrl,
  position = "bottom-right",
  theme,
  lang,
  dir,
  onLoad,
  onError,
}: WidgetLoaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = useMemo(
    () => buildWidgetIframeSrc(projectId, { baseUrl, theme, lang, dir }),
    [projectId, baseUrl, theme, lang, dir]
  );

  const isRight = position === "bottom-right";

  // Listen for postMessage events from the iframe (unread badge updates)
  const messageHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);

  useEffect(() => {
    messageHandlerRef.current = (e: MessageEvent) => {
      const widgetOrigin = baseUrl ? new URL(baseUrl).origin : window.location.origin;
      const isSafeOrigin = e.origin === widgetOrigin || e.origin === "null" || e.origin === window.location.origin;
      if (!isSafeOrigin) return;

      if (e.data?.type === "yoosr:new_message") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener("message", messageHandlerRef.current);
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
    };
  }, [baseUrl]);

  // Reset unread count when opening — inline in toggle to avoid useEffect
  const toggleWithReset = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  return (
    <>
      {/* Launcher Button — always visible */}
      <div
        style={{
          position: "fixed",
          zIndex: IFRAME_Z_INDEX + 1,
          bottom: OFFSET,
          ...(isRight ? { right: OFFSET } : { left: OFFSET }),
        }}
        className="yoosr-widget-launcher-container"
      >
        <button
          onClick={toggleWithReset}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          className="yoosr-widget-launcher w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center cursor-pointer border-0 relative"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 shadow-sm"
              style={{ minWidth: UNREAD_BADGE_SIZE, height: UNREAD_BADGE_SIZE }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Iframe — always mounted, visibility toggled via GPU-accelerated CSS */}
      <div
        className="yoosr-widget-wrapper"
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          zIndex: IFRAME_Z_INDEX,
          bottom: CHAT_BOTTOM_OFFSET,
          ...(isRight ? { right: OFFSET } : { left: OFFSET }),
          width: IFRAME_WIDTH,
          height: IFRAME_HEIGHT,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          /* GPU-accelerated hide/show — no layout recalc */
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          /* Smooth transition using only composited properties */
          transition: "transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease",
          willChange: "transform, opacity",
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title="Yoosr Chat Widget"
          allow="clipboard-write"
          onLoad={onLoad}
          onError={() => onError?.(new Error("Failed to load Yoosr widget iframe"))}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          className="yoosr-widget-iframe"
        />
      </div>
    </>
  );
}
