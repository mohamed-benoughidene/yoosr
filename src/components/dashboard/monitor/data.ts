export const conversations = [
    {
        id: "1",
        user: {
            name: "Alice Smith",
            email: "alice@example.com",
            avatar: "https://github.com/shadcn.png",
            initials: "AS",
        },
        lastMessage: "Hey, I'm having trouble with my billing.",
        timestamp: "10:30 AM",
        unread: 2,
        status: 100,
        tags: ["billing", "urgent"],
        channel: "whatsapp",
        details: {
            department: "Billing",
            language: "en",
            os: "Windows 10",
            browser: "Chrome 98.0",
            sourcePage: "https://yoosr.com/pricing",
            ip: "192.168.1.1",
            location: "New York, USA",
        }
    },
    {
        id: "2",
        user: {
            name: "Bob Jones",
            email: "bob@example.com",
            avatar: "",
            initials: "BJ",
        },
        lastMessage: "Can you help me reset my password?",
        timestamp: "Yesterday",
        unread: 0,
        status: 1000,
        tags: ["support"],
        channel: "web",
        details: {
            department: "Support",
            language: "en",
            os: "macOS Monterey",
            browser: "Safari 15.2",
            sourcePage: "https://yoosr.com/help",
            ip: "10.0.0.1",
            location: "San Francisco, USA",
        }
    },
    {
        id: "3",
        user: {
            name: "Charlie Brown",
            email: "charlie@example.com",
            avatar: "",
            initials: "CB",
        },
        lastMessage: "Is there a discount for non-profits?",
        timestamp: "2 days ago",
        unread: 0,
        status: 100,
        tags: ["sales"],
        channel: "facebook",
        details: {
            department: "Sales",
            language: "es",
            os: "Android 12",
            browser: "Chrome Mobile",
            sourcePage: "https://yoosr.com/products",
            ip: "172.16.0.1",
            location: "Madrid, Spain",
        }
    },
]

export type Conversation = typeof conversations[number]
