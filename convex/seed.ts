import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTestBot = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. We need a default project to attach this to, or we can just try to find the first project.
        // For testing, let's just grab the first project or create a dummy one if none exist.
        let project = await ctx.db.query("projects").first();
        if (!project) {
            const projectId = await ctx.db.insert("projects", {
                name: "Test Project",
                description: "Auto-generated project for bot testing",
                ownerId: "system", // Dummy Clerk ID
                status: "active",
            });
            project = await ctx.db.get(projectId);
        }

        if (!project) {
            throw new Error("Could not find or create a project.");
        }

        // 2. Create the Bot
        const botId = await ctx.db.insert("bots", {
            projectId: project._id,
            name: "Test Welcome Bot",
            description: "A simple bot flow to verify the execution engine",
            type: "chatbot",
            status: "active",
        });

        // 3. Create the Bot Flow nodes
        const nodes = [
            {
                _id: "node_greet",
                name: "Greeting Node",
                actions: [
                    {
                        _type: "reply",
                        text: "Hello there! I'm the Test Welcome Bot. What is your favorite color?",
                    },
                    {
                        _type: "capture_user_reply",
                        attribute: "favoriteColor",
                    }
                ],
                nextBlock: "node_acknowledge",
            },
            {
                _id: "node_acknowledge",
                name: "Acknowledge Node",
                actions: [
                    {
                        _type: "reply",
                        text: "Ah, {{favoriteColor}} is a great color! Wait while I think of something else...",
                    },
                    {
                        _type: "condition",
                        expression: "'{{favoriteColor}}' == 'red'",
                        truePath: "node_red",
                        falsePath: "node_other",
                    }
                ],
            },
            {
                _id: "node_red",
                name: "Red Node",
                actions: [
                    {
                        _type: "reply",
                        text: "Red is the color of fire! 🔥 That's all for now. Goodbye!",
                    }
                ],
            },
            {
                _id: "node_other",
                name: "Other Node",
                actions: [
                    {
                        _type: "reply",
                        text: "That's a nice choice! Have a great day.",
                    }
                ],
            }
        ];

        // 4. Insert the Bot Flow
        await ctx.db.insert("bot_flows", {
            botId: botId,
            slug: "test-welcome-bot",
            version: "1.0.0",
            nodes: nodes,
        });

        return `Successfully seeded Test Bot (ID: ${botId}) for Project (ID: ${project._id}). You can now assigned this bot to a conversation or widget to interact with it!`;
    },
});
