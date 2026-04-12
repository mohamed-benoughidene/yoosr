/**
 * Yoosr Widget Loader — Minimal CDN script for embedding the widget.
 *
 * Usage (drop into any website):
 *
 *   <script>
 *     window.yoosrSettings = { projectId: "YOUR_PROJECT_ID" };
 *   </script>
 *   <script src="https://yoosr.io/loader.js"></script>
 *
 * This script creates an iframe pointing to the Yoosr widget route.
 * The widget runs in an isolated origin — no CSP changes needed on the host page.
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

  var baseUrl = settings.baseUrl || "/widget";
  var theme = settings.theme ? "&theme=" + encodeURIComponent(settings.theme) : "";
  var lang = settings.lang ? "&lang=" + encodeURIComponent(settings.lang) : "";
  var dir = settings.dir ? "&dir=" + encodeURIComponent(settings.dir) : "";

  var src = baseUrl + "?projectId=" + encodeURIComponent(projectId) + theme + lang + dir;

  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "Yoosr Chat Widget";
  iframe.allow = "clipboard-write";
  iframe.style.cssText =
    "position:fixed;" +
    "width:400px;" +
    "height:600px;" +
    "bottom:20px;" +
    "right:20px;" +
    "border:none;" +
    "z-index:9999;";

  document.body.appendChild(iframe);
})();
