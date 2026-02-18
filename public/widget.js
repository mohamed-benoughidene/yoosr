(function (window, document) {
    // 1. Get configuration
    var config = window.yoosrSettings || {};
    if (!config.projectId) {
        console.error("Yoosr Widget: projectId is missing in window.yoosrSettings");
        return;
    }

    // 2. Determine Base URL (where this script is loaded from)
    var scriptSource = document.currentScript
        ? document.currentScript.src
        : "https://yoosr.com/widget.js"; // Fallback
    var baseUrl = new URL(scriptSource).origin;

    // 3. Create Container
    var container = document.createElement("div");
    container.id = "yoosr-widget-container";
    Object.assign(container.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "2147483647", // Max z-index
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
    });

    // 4. Create Iframe
    var iframe = document.createElement("iframe");
    iframe.src =
        baseUrl + "/widget?projectId=" + encodeURIComponent(config.projectId);
    iframe.id = "yoosr-widget-iframe";
    Object.assign(iframe.style, {
        width: "380px",
        height: "600px",
        maxHeight: "calc(100vh - 100px)",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        display: "none", // Hidden initially
        opacity: "0",
        transform: "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
    });

    // 5. Create Launcher Button
    var button = document.createElement("div");
    button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    Object.assign(button.style, {
        width: "60px",
        height: "60px",
        borderRadius: "30px",
        backgroundColor: config.primaryColor || "#000000",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "transform 0.2s ease",
    });

    // 5a. Unread Badge
    var badge = document.createElement("div");
    badge.id = "yoosr-unread-badge";
    Object.assign(badge.style, {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        backgroundColor: "#ff4d4f",
        color: "white",
        borderRadius: "10px",
        padding: "2px 6px",
        fontSize: "12px",
        fontWeight: "bold",
        display: "none",
        border: "2px solid white",
        minWidth: "20px",
        textAlign: "center"
    });
    button.appendChild(badge);

    // Hover effect
    button.onmouseenter = function () { button.style.transform = "scale(1.05)"; };
    button.onmouseleave = function () { button.style.transform = "scale(1)"; };

    // 6. State Management
    var isOpen = false;
    var unreadCount = 0;
    var originalTitle = document.title;
    var isFocused = true;

    window.onfocus = function () { isFocused = true; resetTitle(); };
    window.onblur = function () { isFocused = false; };

    function resetTitle() {
        document.title = originalTitle;
    }

    function toggleWidget() {
        isOpen = !isOpen;
        if (isOpen) {
            unreadCount = 0;
            updateBadge();
            resetTitle();
            iframe.style.display = "block";
            // Small delay to allow display:block to apply before transition
            setTimeout(function () {
                iframe.style.opacity = "1";
                iframe.style.transform = "translateY(0)";
            }, 10);
            button.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            button.appendChild(badge); // Re-append because innerHTML clears it
        } else {
            iframe.style.opacity = "0";
            iframe.style.transform = "translateY(20px)";
            setTimeout(function () {
                iframe.style.display = "none";
            }, 300);
            button.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
            button.appendChild(badge);
        }
    }

    function updateBadge() {
        if (unreadCount > 0 && !isOpen) {
            badge.style.display = "block";
            badge.innerText = unreadCount > 9 ? "9+" : unreadCount;
        } else {
            badge.style.display = "none";
        }
    }

    button.onclick = toggleWidget;

    // 7. Append to DOM
    container.appendChild(iframe);
    container.appendChild(button);
    document.body.appendChild(container);

    // 8. Listen for messages from Iframe
    window.addEventListener("message", function (event) {
        if (event.origin !== baseUrl) return; // Security check

        // Handle "Welcome Notification" or "Auto Open"
        if (event.data.type === "yoosr:auto_open") {
            if (!isOpen) toggleWidget();
        }

        // Handle new message for badge/title
        if (event.data.type === "yoosr:new_message") {
            if (!isOpen) {
                unreadCount++;
                updateBadge();
            }
            if (!isFocused) {
                document.title = "(1 New Message) " + originalTitle;
            }
        }
    });

})(window, document);
