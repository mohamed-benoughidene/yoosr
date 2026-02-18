"use client"

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const playNotificationSound = () => {
    try {
        const audio = new Audio(NOTIFICATION_SOUND);
        // Ensure sound plays even if user hasn't interacted with page yet (though most browsers block this)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn("Sound playback was prevented. This is normal if the user hasn't interacted with the page yet.", err);
            });
        }
    } catch (error) {
        console.error("Audio error:", error);
    }
};

export const updateTabTitle = (count: number, originalTitle: string) => {
    if (count > 0) {
        document.title = `(${count}) ${originalTitle}`;
    } else {
        document.title = originalTitle;
    }
};

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: icon || "/favicon.ico",
        });
    }
};
