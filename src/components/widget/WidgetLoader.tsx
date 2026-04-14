"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
  /** Primary color for the launcher button (hex, e.g. "#6366f1"). Falls back to "#6366f1" */
  primaryColor?: string;
  /** Language locale override */
  lang?: string;
  /** Text direction override */
  dir?: "ltr" | "rtl";
  /** Called when the iframe finishes loading successfully */
  onLoad?: () => void;
  /** Called when the iframe fails to load */
  onError?: (error: Error) => void;
}

// ── Types: Toast ────────────────────────────────────────────────────────────

interface ToastData {
  message: string;
  senderName?: string;
}

// ── Types: Responsive Breakpoint ────────────────────────────────────────────

type ViewportSize = "mobile" | "tablet" | "desktop";

// ── Constants ───────────────────────────────────────────────────────────────
// Industry-standard dimensions (Intercom, Zendesk, Drift):
// - Width: 380px (fits small viewports, matches competitors)
// - Max height: 520px (avoids overflow on 768px screens)
// - Z-index: 999999 (avoids conflicts with modals/navbars)

const IFRAME_Z_INDEX = 999999;
const OFFSET_DESKTOP = 8;
const OFFSET_TABLET = 8;
const LAUNCHER_SIZE = 56;
const UNREAD_BADGE_SIZE = 20;
const TOAST_DURATION_MS = 4000;
const PULSE_DURATION_MS = 600;
// Small gap between launcher and chat window bottom edge (Intercom: ~4px)
const LAUNCHER_TO_WINDOW_GAP = 4;

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Renders the Yoosr chat widget following industry-standard UX patterns
 * (Intercom, Drift, Zendesk):
 *
 * - Launcher button **stays visible** on desktop/tablet when chat is open
 *   and acts as the close/minimize toggle
 * - Launcher **hides on mobile** when chat is full-screen (close button in header)
 * - Chat window on desktop/tablet is positioned **above** the launcher
 *   (bottom offset = launcher height + gap) to prevent overlap
 * - Chat opens as a popover panel above the launcher
 * - Unread message badge on the launcher with pulse animation
 * - Toast notification preview when widget is minimized
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
  primaryColor: primaryColorProp = "#6366f1",
  lang,
  dir,
  onLoad,
  onError,
}: WidgetLoaderProps) {
  // Validate projectId at runtime
  if (!projectId || typeof projectId !== "string") {
    throw new Error("WidgetLoader: projectId is required and must be a non-empty string");
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = 3;

  // ── Fetch project config to get primaryColor (same approach as widget window) ──
  const [fetchedColor, setFetchedColor] = useState<string | null>(null);

  useEffect(() => {
    // If parent explicitly passes primaryColor, skip fetch
    if (primaryColorProp !== "#6366f1") return;

    const controller = new AbortController();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const apiBase = baseUrl
      ? new URL(baseUrl, origin).origin + new URL(baseUrl, origin).pathname.replace(/\/widget$/, "")
      : origin;
    const configUrl = `${apiBase}/api/widget/project?projectId=${encodeURIComponent(projectId)}`;

    fetch(configUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          const cfg = data?.widgetConfig as { primaryColor?: string } | undefined;
          setFetchedColor(cfg?.primaryColor || null);
        }
      })
      .catch(() => {
        // Silently fall back to default color
      });

    return () => controller.abort();
  }, [projectId, baseUrl, primaryColorProp]);

  // Use resolved color: explicit prop > fetched config > default
  const primaryColor = primaryColorProp !== "#6366f1"
    ? primaryColorProp
    : (fetchedColor || "#6366f1");

  // ── Responsive viewport detection ──────────────────────────────────────
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");

  useEffect(() => {
    const mobileMql = window.matchMedia("(max-width: 479px)");
    const tabletMql = window.matchMedia("(min-width: 480px) and (max-width: 768px)");

    const updateViewport = () => {
      if (mobileMql.matches) {
        setViewportSize("mobile");
      } else if (tabletMql.matches) {
        setViewportSize("tablet");
      } else {
        setViewportSize("desktop");
      }
    };

    // Set initial value
    updateViewport();

    // Listen for changes
    const onChange = () => updateViewport();
    mobileMql.addEventListener("change", onChange);
    tabletMql.addEventListener("change", onChange);

    return () => {
      mobileMql.removeEventListener("change", onChange);
      tabletMql.removeEventListener("change", onChange);
    };
  }, []);

  const src = useMemo(
    () => buildWidgetIframeSrc(projectId, { baseUrl, theme, lang, dir, vp: viewportSize }),
    [projectId, baseUrl, theme, lang, dir, viewportSize]
  );

  const isRight = position === "bottom-right";

  // ── Focus management: Escape key ─────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        requestAnimationFrame(() => {
          launcherRef.current?.focus();
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // ── Iframe retry with exponential backoff ─────────────────────────
  useEffect(() => {
    if (!iframeError || retryCount >= maxRetries) return;

    // Exponential backoff: 2s, 4s, 8s
    const delay = Math.pow(2, retryCount) * 1000;

    retryTimerRef.current = setTimeout(() => {
      setIframeError(false);
      setRetryCount((prev) => prev + 1);
      setIsLoading(true);
    }, delay);

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [iframeError, retryCount]);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Compute dynamic iframe styles based on viewport
  const iframeWrapperStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      position: "fixed",
      zIndex: IFRAME_Z_INDEX,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      transform: isOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? "auto" : "none",
      transition: "transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease",
      willChange: "transform, opacity",
    };

    if (viewportSize === "mobile") {
      return {
        ...baseStyles,
        width: "100vw",
        height: "100vh",
        maxHeight: "none",
        borderRadius: "0px",
        bottom: "0px",
        right: isRight ? "0px" : undefined,
        left: isRight ? undefined : "0px",
      };
    }

    // On desktop/tablet, the chat window sits ABOVE the launcher
    // bottom = launcherSize + launcherOffset + gap
    const windowBottom = LAUNCHER_SIZE + OFFSET_DESKTOP + LAUNCHER_TO_WINDOW_GAP;
    const windowBottomTablet = LAUNCHER_SIZE + OFFSET_TABLET + LAUNCHER_TO_WINDOW_GAP;

    if (viewportSize === "tablet") {
      return {
        ...baseStyles,
        width: "calc(100vw - 32px)",
        height: "auto",
        maxHeight: "calc(100vh - 140px)",
        bottom: `${windowBottomTablet}px`,
        right: isRight ? `${windowBottomTablet}px` : undefined,
        left: isRight ? undefined : `${windowBottomTablet}px`,
      };
    }

    // Desktop
    return {
      ...baseStyles,
      width: 380,
      height: 520,
      maxHeight: "calc(100vh - 140px)",
      bottom: `${windowBottom}px`,
      right: isRight ? `${windowBottom}px` : undefined,
      left: isRight ? undefined : `${windowBottom}px`,
    };
  }, [isOpen, viewportSize, isRight]);

  // Listen for postMessage events from the iframe (unread badge + toast updates)
  const messageHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);

  useEffect(() => {
    messageHandlerRef.current = (e: MessageEvent) => {
      const widgetOrigin = baseUrl ? new URL(baseUrl).origin : window.location.origin;
      const isSafeOrigin = e.origin === widgetOrigin || e.origin === "null" || e.origin === window.location.origin;
      if (!isSafeOrigin) return;

      if (e.data?.type === "yoosr:new_message") {
        setUnreadCount((prev) => prev + 1);

        // Pulse animation on launcher
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), PULSE_DURATION_MS);

        // Show toast preview only when widget is minimized
        if (!isOpen) {
          // Clear any existing toast timer
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

          const senderName = e.data.senderName;
          const messageText = e.data.message ?? "";

          setToast({ message: messageText, senderName });

          // Auto-dismiss after TOAST_DURATION_MS
          toastTimerRef.current = setTimeout(() => {
            setToast(null);
          }, TOAST_DURATION_MS);
        }
      }

      // Close widget from iframe's close button (mobile)
      if (e.data?.type === "yoosr:close") {
        setIsOpen(false);
        requestAnimationFrame(() => {
          launcherRef.current?.focus();
        });
      }
    };

    window.addEventListener("message", messageHandlerRef.current);
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
    };
  }, [baseUrl, isOpen]);

  // Reset unread count and dismiss toast when opening
  const toggleWithReset = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setUnreadCount(0);
        setToast(null);
        setIsLoading(false); // Iframe already loaded, no need to show skeleton on reopen
        setIframeError(false);
        setRetryCount(0);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      } else {
        // Returning focus to launcher on close
        requestAnimationFrame(() => {
          launcherRef.current?.focus();
        });
      }
      return !prev;
    });
  }, []);

  // Notify iframe of visibility changes and request focus on input when opened
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "yoosr:visibility_change", visible: isOpen },
        "*",
      );
      if (isOpen) {
        iframeRef.current.contentWindow.postMessage(
          { type: "yoosr:focus_input", payload: {} },
          "*",
        );
      }
    }
  }, [isOpen]);

  // Handle toast click — open widget and dismiss toast
  const handleToastClick = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Compute hover color by darkening the primary color
  const hoverColor = useMemo(() => {
    // Simple hex-to-rgb-to-darken-to-hex utility
    const hex = primaryColor.replace("#", "");
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 20);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 20);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 20);
    return `rgb(${r}, ${g}, ${b})`;
  }, [primaryColor]);

  // Compute rgba for shadow/pulse effects
  const primaryColorRgba = useMemo(() => {
    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, `;
  }, [primaryColor]);

  return (
    <>
      {/* Toast Notification — shown only when widget is minimized */}
      {toast && !isOpen && (
        <button
          onClick={handleToastClick}
          aria-live="polite"
          aria-label={`New message from ${toast.senderName ?? "support"}: ${toast.message}`}
          className="fixed z-[9998] animate-in slide-in-from-bottom-4 fade-in-0 cursor-pointer"
          style={{
            // Toast sits above the launcher button
            bottom: (viewportSize === "tablet" ? OFFSET_TABLET : OFFSET_DESKTOP) + LAUNCHER_SIZE + LAUNCHER_TO_WINDOW_GAP,
            ...(isRight
              ? { right: (viewportSize === "tablet" ? OFFSET_TABLET : OFFSET_DESKTOP) + 12 }
              : { left: (viewportSize === "tablet" ? OFFSET_TABLET : OFFSET_DESKTOP) + 12 }),
            maxWidth: 320,
            background: "white",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: "10px 14px",
            textAlign: "left",
            direction: dir || "ltr",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {(toast.senderName ?? "S").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {toast.senderName ?? "Support"}
              </p>
              <p className="text-xs text-gray-600 truncate">{toast.message}</p>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">now</span>
          </div>
        </button>
      )}

      {/* Launcher Button — visible on desktop/tablet always, hidden on mobile when full-screen */}
      <div
        style={{
          position: "fixed",
          zIndex: IFRAME_Z_INDEX + 1,
          bottom: viewportSize === "tablet" ? OFFSET_TABLET : OFFSET_DESKTOP,
          ...(isRight
            ? { right: viewportSize === "tablet" ? OFFSET_TABLET : OFFSET_DESKTOP }
            : { left: viewportSize === "tablet" ? OFFSET_TABLET : OFFSET_DESKTOP }),
          // On mobile, the widget is full-screen — hide the launcher to avoid clutter
          // The iframe has its own close button in the header
          display: viewportSize === "mobile" && isOpen ? "none" : undefined,
        }}
        className="yoosr-widget-launcher-container"
      >
        <button
          ref={launcherRef}
          onClick={toggleWithReset}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          className={`yoosr-widget-launcher w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center cursor-pointer border-0 relative ${isPulsing ? "yoosr-launcher-pulse" : ""}`}
          style={{
            backgroundColor: primaryColor,
            transition: "background-color 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = primaryColor;
          }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}

          {/* Loading Indicator — shown during initial iframe load (Intercom-style blue dot) */}
          {isLoading && !isOpen && (
            <span className="absolute top-1 right-1 flex items-center justify-center">
              <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white" />
            </span>
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
        style={iframeWrapperStyles}
      >
        {/* Loading Skeleton — shown while iframe is loading */}
        {isLoading && isOpen && (
          <div className="absolute inset-0 bg-white flex flex-col">
            {/* Header skeleton */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: primaryColor }}>
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-white/30 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
            {/* Messages skeleton */}
            <div className="flex-1 px-4 py-3 space-y-4 overflow-hidden">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 w-48 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              </div>
              <div className="flex justify-end">
                <div className="h-10 w-40 rounded-2xl animate-pulse" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-16 w-56 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>
            {/* Input skeleton */}
            <div className="border-t px-3 py-2 flex gap-2 items-center">
              <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
              <div className="flex-1 h-10 rounded bg-gray-100 animate-pulse" />
              <div className="w-16 h-10 rounded animate-pulse" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
            </div>
          </div>
        )}

        {/* Error Overlay — shown when iframe fails to load */}
        {iframeError && isOpen && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center" role="alert" aria-live="assertive">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Unable to load chat</h3>
            <p className="text-xs text-gray-500 mb-4">
              {retryCount < maxRetries
                ? `Retrying automatically (${retryCount}/${maxRetries})...`
                : "Please check your connection and try again."}
            </p>
            {retryCount >= maxRetries && (
              <button
                onClick={() => {
                  setIframeError(false);
                  setRetryCount(0);
                  setIsLoading(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-md"
                style={{ backgroundColor: primaryColor }}
              >
                Retry
              </button>
            )}
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          title="Yoosr Chat Widget"
          allow="clipboard-write"
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => {
            setIsLoading(false);
            setIframeError(true);
            onError?.(new Error("Failed to load Yoosr widget iframe"));
          }}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          className="yoosr-widget-iframe"
        />
      </div>

      {/* Pulse Animation Keyframes — dynamic based on primaryColor */}
      <style>{`
        @keyframes yoosr-launcher-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 14px ${primaryColorRgba}0.4); }
          50% { transform: scale(1.1); box-shadow: 0 4px 24px ${primaryColorRgba}0.6); }
        }
        .yoosr-launcher-pulse {
          animation: yoosr-launcher-pulse ${PULSE_DURATION_MS}ms ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .yoosr-launcher-pulse {
            animation: none;
          }
          .yoosr-widget-launcher-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .yoosr-widget-wrapper * {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
