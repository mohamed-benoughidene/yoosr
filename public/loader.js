/**
 * Yoosr Widget Loader — Full-featured CDN script for embedding the widget.
 *
 * Usage (drop into any website):
 *
 *   <script>
 *     window.yoosrSettings = { projectId: "YOUR_PROJECT_ID" };
 *   </script>
 *   <script src="https://yoosr.io/loader.js"></script>
 *
 * This script:
 *   1. Fetches project config (including primaryColor) from the widget API
 *   2. Creates a launcher button styled with the project's theme color
 *   3. Opens/closes the widget iframe on click
 *
 * The widget runs in an isolated iframe — no CSP changes needed on the host page.
 */
(function () {
  "use strict";

  var settings = window.yoosrSettings || {};
  var projectId = settings.projectId;

  if (!projectId || typeof projectId !== "string" || projectId.trim().length === 0) {
    console.warn("[Yoosr] Missing or invalid projectId. Widget will not load.");
    return;
  }

  // Sanitize: only allow alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    console.warn("[Yoosr] Invalid projectId format. Widget will not load.");
    return;
  }

  // ── Configuration ──────────────────────────────────────────────────────

  var DEFAULT_COLOR = "#6366f1";
  var LAUNCHER_SIZE = 56;
  var OFFSET = 20;
  var Z_INDEX = 999999;
  var IFRAME_WIDTH = 380;
  var IFRAME_HEIGHT = 520;
  var PULSE_DURATION = 600;

  var position = settings.position === "bottom-left" ? "left" : "right";
  var baseUrl = settings.baseUrl || "";

  // Resolve base URL: if not provided, derive from the current script's src
  if (!baseUrl) {
    var scripts = document.getElementsByTagName("script");
    var currentScript = scripts[scripts.length - 1];
    var scriptSrc = currentScript.src || "";
    if (scriptSrc) {
      try {
        var url = new URL(scriptSrc);
        baseUrl = url.origin + "/widget";
      } catch {
        baseUrl = "/widget";
      }
    } else {
      baseUrl = "/widget";
    }
  }

  // ── State ──────────────────────────────────────────────────────────────

  var isOpen = false;
  var primaryColor = DEFAULT_COLOR;

  // ── Helpers ────────────────────────────────────────────────────────────

  function darkenColor(hex, amount) {
    hex = hex.replace("#", "");
    var r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
    var g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
    var b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  function toRgba(hex, alpha) {
    hex = hex.replace("#", "");
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  function buildIframeSrc() {
    var src = baseUrl + "?projectId=" + encodeURIComponent(projectId);
    if (settings.theme) src += "&theme=" + encodeURIComponent(settings.theme);
    if (settings.lang) src += "&lang=" + encodeURIComponent(settings.lang);
    if (settings.dir) src += "&dir=" + encodeURIComponent(settings.dir);
    return src;
  }

  // ── Fetch project config ───────────────────────────────────────────────

  function fetchConfig() {
    var apiBaseUrl = baseUrl.replace("/widget", "");
    var configUrl = apiBaseUrl + "/api/widget/project?projectId=" + encodeURIComponent(projectId);

    fetch(configUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && data.widgetConfig && data.widgetConfig.primaryColor) {
          primaryColor = data.widgetConfig.primaryColor;
        }
        applyTheme();
      })
      .catch(function () {
        // Use default color if fetch fails
        applyTheme();
      });
  }

  // ── Create DOM elements ────────────────────────────────────────────────

  var launcherContainer;
  var iframeWrapper;
  var iframe;
  var styleEl;

  function createElements() {
    // Style element for animations
    styleEl = document.createElement("style");
    styleEl.id = "yoosr-styles";
    document.head.appendChild(styleEl);

    // Launcher container
    launcherContainer = document.createElement("div");
    launcherContainer.className = "yoosr-launcher-container";
    launcherContainer.style.cssText =
      "position:fixed;" +
      "z-index:" + (Z_INDEX + 1) + ";" +
      "bottom:" + OFFSET + "px;" +
      position + ":" + OFFSET + "px;";

    // Launcher button
    var launcherBtn = document.createElement("button");
    launcherBtn.className = "yoosr-launcher";
    launcherBtn.setAttribute("aria-label", "Open chat");
    launcherBtn.style.cssText =
      "width:" + LAUNCHER_SIZE + "px;" +
      "height:" + LAUNCHER_SIZE + "px;" +
      "border-radius:50%;" +
      "border:none;" +
      "color:#fff;" +
      "cursor:pointer;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "box-shadow:0 4px 14px " + toRgba(primaryColor, "0.4") + ";" +
      "background-color:" + primaryColor + ";" +
      "transition:background-color 150ms ease, box-shadow 150ms ease;" +
      "font-family:inherit;" +
      "padding:0;";

    // Chat icon (SVG)
    launcherBtn.innerHTML =
      '<svg class="yoosr-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      "</svg>" +
      '<svg class="yoosr-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/>' +
      "</svg>";

    // Hover effect
    var hoverColor = darkenColor(primaryColor, 20);
    launcherBtn.addEventListener("mouseenter", function () {
      launcherBtn.style.backgroundColor = hoverColor;
      launcherBtn.style.boxShadow = "0 4px 20px " + toRgba(primaryColor, "0.5");
    });
    launcherBtn.addEventListener("mouseleave", function () {
      if (!isOpen) {
        launcherBtn.style.backgroundColor = primaryColor;
        launcherBtn.style.boxShadow = "0 4px 14px " + toRgba(primaryColor, "0.4");
      }
    });

    // Click handler
    launcherBtn.addEventListener("click", function () {
      if (isOpen) {
        closeWidget();
      } else {
        openWidget();
      }
    });

    launcherContainer.appendChild(launcherBtn);
    document.body.appendChild(launcherContainer);

    // Iframe wrapper (hidden initially)
    iframeWrapper = document.createElement("div");
    iframeWrapper.className = "yoosr-iframe-wrapper";
    iframeWrapper.style.cssText =
      "position:fixed;" +
      "z-index:" + Z_INDEX + ";" +
      "width:" + IFRAME_WIDTH + "px;" +
      "height:" + IFRAME_HEIGHT + "px;" +
      "max-height:calc(100vh - 140px);" +
      "bottom:" + (LAUNCHER_SIZE + OFFSET + 4) + "px;" +
      position + ":" + (OFFSET + 4) + "px;" +
      "border-radius:12px;" +
      "overflow:hidden;" +
      "box-shadow:0 8px 32px rgba(0,0,0,0.15);" +
      "opacity:0;" +
      "transform:translateY(8px) scale(0.96);" +
      "pointer-events:none;" +
      "transition:transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease;" +
      "will-change:transform, opacity;";

    iframe = document.createElement("iframe");
    iframe.src = buildIframeSrc();
    iframe.title = "Yoosr Chat Widget";
    iframe.allow = "clipboard-write";
    iframe.style.cssText = "width:100%;height:100%;border:none;";
    iframeWrapper.appendChild(iframe);
    document.body.appendChild(iframeWrapper);

    // Inject animation keyframes
    updatePulseAnimation();
  }

  // ── Theme application ──────────────────────────────────────────────────

  function applyTheme() {
    var btn = launcherContainer ? launcherContainer.querySelector(".yoosr-launcher") : null;
    if (btn) {
      var hover = darkenColor(primaryColor, 20);
      btn.style.backgroundColor = primaryColor;
      btn.style.boxShadow = "0 4px 14px " + toRgba(primaryColor, "0.4");

      // Update hover color
      btn.onmouseenter = function () {
        btn.style.backgroundColor = hover;
        btn.style.boxShadow = "0 4px 20px " + toRgba(primaryColor, "0.5");
      };
      btn.onmouseleave = function () {
        if (!isOpen) {
          btn.style.backgroundColor = primaryColor;
          btn.style.boxShadow = "0 4px 14px " + toRgba(primaryColor, "0.4");
        }
      };
    }
    updatePulseAnimation();
  }

  function updatePulseAnimation() {
    if (!styleEl) return;
    styleEl.textContent =
      "@keyframes yoosr-launcher-pulse{" +
      "0%,100%{transform:scale(1);box-shadow:0 4px 14px " + toRgba(primaryColor, "0.4") + "}" +
      "50%{transform:scale(1.1);box-shadow:0 4px 24px " + toRgba(primaryColor, "0.6") + "}" +
      "}" +
      ".yoosr-launcher-pulse{" +
      "animation:yoosr-launcher-pulse " + PULSE_DURATION + "ms ease-in-out" +
      "}";
  }

  // ── Open / Close ───────────────────────────────────────────────────────

  function openWidget() {
    isOpen = true;
    iframeWrapper.style.opacity = "1";
    iframeWrapper.style.transform = "translateY(0) scale(1)";
    iframeWrapper.style.pointerEvents = "auto";

    var btn = launcherContainer.querySelector(".yoosr-launcher");
    btn.setAttribute("aria-label", "Close chat");
    btn.querySelector(".yoosr-icon-open").style.display = "none";
    btn.querySelector(".yoosr-icon-close").style.display = "block";

    var hover = darkenColor(primaryColor, 20);
    btn.style.backgroundColor = hover;
    btn.style.boxShadow = "0 4px 20px " + toRgba(primaryColor, "0.5");

    // Focus input inside iframe
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "yoosr:focus_input", payload: {} }, "*");
    }
  }

  function closeWidget() {
    isOpen = false;
    iframeWrapper.style.opacity = "0";
    iframeWrapper.style.transform = "translateY(8px) scale(0.96)";
    iframeWrapper.style.pointerEvents = "none";

    var btn = launcherContainer.querySelector(".yoosr-launcher");
    btn.setAttribute("aria-label", "Open chat");
    btn.querySelector(".yoosr-icon-open").style.display = "block";
    btn.querySelector(".yoosr-icon-close").style.display = "none";

    btn.style.backgroundColor = primaryColor;
    btn.style.boxShadow = "0 4px 14px " + toRgba(primaryColor, "0.4");
  }

  // ── Escape key listener ────────────────────────────────────────────────

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) {
      closeWidget();
    }
  });

  // ── Responsive: hide launcher on small screens when open ───────────────

  function handleResize() {
    if (window.innerWidth <= 479 && isOpen) {
      // Mobile: make iframe full-screen
      iframeWrapper.style.cssText =
        "position:fixed;" +
        "z-index:" + Z_INDEX + ";" +
        "width:100vw;" +
        "height:100vh;" +
        "max-height:none;" +
        "bottom:0;" +
        "right:0;" +
        "left:0;" +
        "border-radius:0;" +
        "overflow:hidden;" +
        "box-shadow:none;" +
        "opacity:1;" +
        "transform:none;" +
        "pointer-events:auto;";
      launcherContainer.style.display = "none";
    } else if (launcherContainer) {
      launcherContainer.style.display = "";
      // Restore desktop/tablet styles
      iframeWrapper.style.cssText =
        "position:fixed;" +
        "z-index:" + Z_INDEX + ";" +
        "width:" + IFRAME_WIDTH + "px;" +
        "height:" + IFRAME_HEIGHT + "px;" +
        "max-height:calc(100vh - 140px);" +
        "bottom:" + (LAUNCHER_SIZE + OFFSET + 4) + "px;" +
        position + ":" + (OFFSET + 4) + "px;" +
        "border-radius:12px;" +
        "overflow:hidden;" +
        "box-shadow:0 8px 32px rgba(0,0,0,0.15);" +
        (isOpen
          ? "opacity:1;transform:translateY(0) scale(1);pointer-events:auto;"
          : "opacity:0;transform:translateY(8px) scale(0.96);pointer-events:none;") +
        "transition:transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease;" +
        "will-change:transform, opacity;";
    }
  }

  window.addEventListener("resize", handleResize);

  // ── Initialize ─────────────────────────────────────────────────────────

  createElements();
  fetchConfig();
})();
