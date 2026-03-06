import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// Clerk webhook to sync user data
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const eventType = body.type;

        if (eventType === "user.created" || eventType === "user.updated") {
            const user = body.data;
            await ctx.runMutation(internal.profiles.upsertFromClerk, {
                userId: user.id,
                fullName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || undefined,
                email: user.email_addresses?.[0]?.email_address,
                avatarUrl: user.image_url,
            });
        }

        return new Response("OK", { status: 200 });
    }),
});

// Public endpoint for widget to create conversations
http.route({
    path: "/widget/conversations",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { projectId, visitorName, visitorEmail, visitorPhone, visitorId, initialMessage } = body;

        if (!projectId) {
            return new Response(JSON.stringify({ error: "projectId is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        const conversationId = await ctx.runMutation(
            internal.conversations.createFromWidget,
            { projectId, visitorName, visitorEmail, visitorPhone, visitorId, initialMessage }
        );

        return new Response(JSON.stringify({ conversationId }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }),
});

// Public endpoint for widget to send messages
http.route({
    path: "/widget/messages",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { conversationId, content, visitorId } = body;

        if (!conversationId || !content) {
            return new Response(
                JSON.stringify({ error: "conversationId and content are required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                }
            );
        }

        const { messageId, conversationId: newConversationId } = await ctx.runMutation(
            internal.messages.sendFromWidget,
            { conversationId, content, senderId: visitorId }
        );

        return new Response(JSON.stringify({ messageId, conversationId: newConversationId }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }),
});

// CORS preflight for all widget endpoints
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

http.route({
    path: "/widget/conversations",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

http.route({
    path: "/widget/messages",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

http.route({
    path: "/widget/project",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});



http.route({
    path: "/widget/conversations/get",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

http.route({
    path: "/widget/conversations/rate",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

// GET /widget/project?projectId=xxx — Fetch project config for widget
http.route({
    path: "/widget/project",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const projectId = url.searchParams.get("projectId");
        if (!projectId) {
            return new Response(JSON.stringify({ error: "projectId required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const project = await ctx.runQuery(internal.projects.getPublic, {
            id: projectId,
        });

        return new Response(JSON.stringify(project ?? {}), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }),
});

// GET /widget/conversations/get?id=xxx — Fetch single conversation public data
http.route({
    path: "/widget/conversations/get",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return new Response(JSON.stringify({ error: "id required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const conversation = await ctx.runQuery(internal.conversations.getInternal, {
            id: id as any,
        });

        // Filter sensitive data
        if (!conversation) return new Response("null", { status: 200, headers: { ...corsHeaders } });

        const publicData = {
            _id: conversation._id,
            status: conversation.status,
            rating: conversation.rating,
            projectId: conversation.projectId,
        };

        return new Response(JSON.stringify(publicData), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }),
});

// POST /widget/conversations/rate - Rate a conversation
http.route({
    path: "/widget/conversations/rate",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { id, rating, feedback } = body;

        if (!id || !rating) {
            return new Response(JSON.stringify({ error: "id and rating are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // Update conversation record (legacy)
        await ctx.runMutation(internal.analytics.submitCSATInternal, {
            conversationId: id as any,
            rating,
            comment: feedback,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }),
});

// GET /widget/conversations?projectId=xxx&visitorId=yyy — Find existing conversation
http.route({
    path: "/widget/conversations",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const projectId = url.searchParams.get("projectId");
        const visitorId = url.searchParams.get("visitorId");

        if (!projectId || !visitorId) {
            return new Response(JSON.stringify({ error: "projectId and visitorId required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const conversation = await ctx.runQuery(internal.conversations.findByVisitor, {
            projectId: projectId as any,
            visitorId,
        });

        return new Response(JSON.stringify(conversation ?? null), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }),
});

// GET /widget/messages?conversationId=xxx — Fetch messages for a conversation
http.route({
    path: "/widget/messages",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const conversationId = url.searchParams.get("conversationId");

        if (!conversationId) {
            return new Response(JSON.stringify({ error: "conversationId required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const messages = await ctx.runQuery(internal.messages.listPublic, {
            conversationId: conversationId as any,
        });

        return new Response(JSON.stringify(messages ?? []), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }),
});

// GET /webhooks/meta (Meta verification)
http.route({
    path: "/webhooks/meta",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const verifyToken = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

        if (mode === "subscribe" && verifyToken === WEBHOOK_VERIFY_TOKEN) {
            return new Response(challenge, { status: 200 });
        }

        return new Response("Forbidden", { status: 403 });
    }),
});

// POST /webhooks/meta (incoming messages)
http.route({
    path: "/webhooks/meta",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();

            if (body.object !== "page" && body.object !== "instagram") {
                return new Response("Not Found", { status: 404 });
            }

            if (body.entry && Array.isArray(body.entry)) {
                for (const entry of body.entry) {
                    if (entry.messaging && Array.isArray(entry.messaging)) {
                        for (const messaging of entry.messaging) {
                            if (!messaging.message || messaging.message.is_echo === true) {
                                continue;
                            }

                            const pageId = entry.id;
                            const senderId = messaging.sender.id;
                            const messageText = messaging.message.text;
                            const messageId = messaging.message.mid;
                            const channel = body.object === "instagram" ? "instagram" : "messenger";

                            // @ts-ignore - Will be implemented later
                            await ctx.runMutation(internal.conversations.createOrUpdateFromMeta, {
                                pageId,
                                senderId,
                                messageText,
                                messageId,
                                channel,
                            });
                        }
                    }
                }
            }

            return new Response("OK", { status: 200 });
        } catch (error) {
            console.error("Error processing Meta webhook:", error);
            // Always return 200 per Meta webhook requirements
            return new Response("OK", { status: 200 });
        }
    }),
});

export default http;
