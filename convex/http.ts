import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { RateLimiter } from "@convex-dev/rate-limiter";
import { decryptSecret } from "./lib/crypto";
import { Webhook } from "svix";
import { logger } from "./lib/logger";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  createConversation: { kind: "fixed window", rate: 5, period: 60000 },
  sendMessage: { kind: "token bucket", rate: 20, period: 60000, capacity: 5 },
});

const http = httpRouter();

/**
 * Constant-time string comparison to prevent timing attacks.
 * Both strings must be the same length (checked by caller).
 */
function constantTimeCompare(a: string, b: string): boolean {
    const aBytes = new TextEncoder().encode(a);
    const bBytes = new TextEncoder().encode(b);
    if (aBytes.length !== bBytes.length) return false;

    let diff = 0;
    for (let i = 0; i < aBytes.length; i++) {
        diff |= aBytes[i] ^ bBytes[i];
    }
    return diff === 0;
}

// Clerk webhook to sync user data
// SECURITY: Uses Svix to verify webhook signatures before processing
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            // Read raw body BEFORE parsing (Svix needs raw string)
            const rawBody = await request.text();
            const headers = Object.fromEntries(request.headers.entries());

            // Verify signature - reject if webhook secret not configured
            const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
            if (!webhookSecret) {
                logger.error("CLERK_WEBHOOK_SECRET not configured - rejecting webhook");
                return new Response("Webhook secret not configured", { status: 500 });
            }

            const webhook = new Webhook(webhookSecret);
            try {
                webhook.verify(rawBody, headers);
            } catch (err) {
                logger.error("Invalid Clerk webhook signature", { error: err instanceof Error ? err.message : String(err) });
                return new Response("Invalid signature", { status: 401 });
            }

            // Now safe to parse
            const body = JSON.parse(rawBody);
            const eventType = body.type;

            if (eventType === "user.created" || eventType === "user.updated") {
                const user = body.data;
                await ctx.runMutation(internal.profiles.upsertFromClerk, {
                    userId: user.id,
                    fullName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || undefined,
                    email: user.email_addresses?.[0]?.email_address,
                    avatarUrl: user.image_url,
                });
            } else if (eventType === "organization.deleted") {
                const orgId = body.data.id;
                const project = await ctx.runQuery(internal.projects.getByOrgIdInternal, { orgId });
                if (project) {
                    await ctx.runMutation(internal.projects.remove, { id: project._id });
                }
            }

            return new Response("OK", { status: 200 });
        } catch (error) {
            logger.error("Error processing Clerk webhook", { error: error instanceof Error ? error.message : String(error) });
            return new Response("Internal Server Error", { status: 500 });
        }
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

        const { ok } = await rateLimiter.limit(ctx, "createConversation", { key: visitorId ?? projectId, throws: false });
        if (!ok) {
            return new Response(JSON.stringify({ error: "Too many requests" }), {
                status: 429,
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

        if (!conversationId || (!content && !body.fileId)) {
            return new Response(
                JSON.stringify({ error: "conversationId and content are required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                }
            );
        }

        const { ok } = await rateLimiter.limit(ctx, "sendMessage", { key: visitorId ?? conversationId, throws: false });
        if (!ok) {
            return new Response(JSON.stringify({ error: "Too many requests" }), {
                status: 429,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        const { messageId, conversationId: newConversationId } = await ctx.runMutation(
            internal.messages.sendFromWidget,
            { 
                conversationId, 
                content, 
                senderId: visitorId,
                fileId: body.fileId,
                fileName: body.fileName
            }
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
    path: "/widget/upload-url",
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
            id: id as Id<"conversations">,
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
            conversationId: id as Id<"conversations">,
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
            projectId: projectId as Id<"projects">,
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
            conversationId: conversationId as Id<"conversations">,
            limit: 100,
        });

        // Also fetch typing status for this conversation
        const typingStatus = await ctx.runQuery(internal.messages.getTypingStatus, {
            conversationId: conversationId as Id<"conversations">,
        });

        return new Response(JSON.stringify({
            messages: messages ?? [],
            isAgentTyping: typingStatus.isAgentTyping,
            isVisitorTyping: typingStatus.isVisitorTyping,
            typingSenderName: typingStatus.agentName,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }),
});

// POST /widget/upload-url — Generate upload URL for widget file attachments
http.route({
    path: "/widget/upload-url",
    method: "POST",
    handler: httpAction(async (ctx) => {
        const uploadUrl = await ctx.runMutation(internal.messages.generateWidgetUploadUrl);

        return new Response(JSON.stringify({ uploadUrl }), {
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

        if (mode !== "subscribe" || !verifyToken) {
            return new Response("Forbidden", { status: 403 });
        }

        // Check against all enabled WhatsApp integrations' verify_token
        const integrations = await ctx.runQuery(internal.integrations.listAllEnabledMetaIntegrations);

        const match = integrations.find(
            (i: { credentials?: Record<string, unknown> }) =>
                (i.credentials as { verify_token?: string })?.verify_token === verifyToken
        );

        if (match) {
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
            const rawBody = await request.text();
            const body = JSON.parse(rawBody);
            const signature = request.headers.get("X-Hub-Signature-256");

            if (!signature) {
                return new Response("Forbidden", { status: 403 });
            }

            // Identify the integration first by parsing the webhook body
            let integration: { _id: Id<"integrations">; credentials?: Record<string, unknown> } | undefined | null;

            if (body.object === "whatsapp_business_account") {
                // Extract phone_number_id from first entry/change
                if (body.entry && Array.isArray(body.entry) && body.entry.length > 0) {
                    const change = body.entry[0]?.changes?.[0];
                    const phoneNumberId = change?.value?.metadata?.phone_number_id;
                    if (phoneNumberId) {
                        integration = await ctx.runQuery(internal.integrations.getWhatsAppIntegrationByPhoneNumberId, {
                            phoneNumberId,
                        });
                    }
                }
            } else if (body.object === "page") {
                // entry.id is the page_id
                if (body.entry && Array.isArray(body.entry) && body.entry.length > 0) {
                    const pageId = body.entry[0].id;
                    if (pageId) {
                        integration = await ctx.runQuery(internal.integrations.getMessengerIntegrationByPageId, {
                            pageId,
                        });
                    }
                }
            } else if (body.object === "instagram") {
                // entry.id is the instagram account/page_id
                if (body.entry && Array.isArray(body.entry) && body.entry.length > 0) {
                    const pageId = body.entry[0].id;
                    if (pageId) {
                        integration = await ctx.runQuery(internal.integrations.getInstagramIntegrationByPageId, {
                            pageId,
                        });
                    }
                }
            }

            // If no integration found, reject
            if (!integration || !integration.credentials) {
                return new Response("Forbidden", { status: 403 });
            }

            // Decrypt the app_secret for this integration
            const appSecret = (integration.credentials as { app_secret?: string }).app_secret;
            if (!appSecret) {
                return new Response("Forbidden", { status: 403 });
            }

            const key = process.env.ENCRYPTION_KEY;
            if (!key) {
                return new Response("Forbidden", { status: 403 });
            }

            const decryptedSecret = await decryptSecret(appSecret, key);

            // Verify signature using this integration's secret
            const encoder = new TextEncoder();
            const hmacKey = await crypto.subtle.importKey(
                "raw",
                encoder.encode(decryptedSecret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signatureBuffer = await crypto.subtle.sign(
                "HMAC",
                hmacKey,
                encoder.encode(rawBody)
            );
            const hashArray = Array.from(new Uint8Array(signatureBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const expectedSignature = `sha256=${hashHex}`;

            // Use constant-time comparison to prevent timing attacks
            if (signature.length !== expectedSignature.length ||
                !constantTimeCompare(signature, expectedSignature)) {
                return new Response("Forbidden", { status: 403 });
            }

            // Signature verified — process messages
            if (body.object === "whatsapp_business_account") {
                if (body.entry && Array.isArray(body.entry)) {
                    for (const entry of body.entry) {
                        if (entry.changes && Array.isArray(entry.changes)) {
                            for (const change of entry.changes) {
                                if (change.field === "messages") {
                                    const phoneNumberId = change.value.metadata.phone_number_id;
                                    const integration = await ctx.runQuery(internal.integrations.getWhatsAppIntegrationByPhoneNumberId, {
                                        phoneNumberId: phoneNumberId,
                                    });

                                    if (!integration) continue;

                                    if (change.value.messages && Array.isArray(change.value.messages)) {
                                        for (const message of change.value.messages) {
                                            if (message.type !== "text") continue;

                                            let senderId = message.from;
                                            let senderName = message.from;

                                            if (change.value.contacts && Array.isArray(change.value.contacts)) {
                                                const contact = change.value.contacts.find(
                                                    (c: { wa_id?: string; profile?: { name?: string } }) => c.wa_id === message.from
                                                );
                                                if (contact) {
                                                    senderId = contact.wa_id || senderId;
                                                    senderName = contact.profile?.name || senderId;
                                                }
                                            }

                                            await ctx.runMutation(internal.conversations.createOrUpdateFromMeta, {
                                                channel: "whatsapp",
                                                pageId: undefined,
                                                phoneNumberId: phoneNumberId,
                                                senderId: senderId,
                                                senderName: senderName,
                                                messageText: message.text.body,
                                                messageId: message.id,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return new Response("OK", { status: 200 });
            }

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
            logger.error("Error processing Meta webhook", { error: error instanceof Error ? error.message : String(error) });
            // Always return 200 per Meta webhook requirements
            return new Response("OK", { status: 200 });
        }
    }),
});

// GET /webhooks/telegram — Not supported.
// Telegram uses setWebhook with POST only (verified via X-Telegram-Bot-Api-Secret-Token).
// If you need verification, configure a secret_token when calling setWebhook.
http.route({
    path: "/webhooks/telegram",
    method: "GET",
    handler: httpAction(async () => {
        return new Response("Method Not Allowed. Telegram webhooks use POST only.", { status: 405 });
    }),
});

// POST /webhooks/telegram (incoming messages)
http.route({
    path: "/webhooks/telegram",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
            if (!secretToken) {
                return new Response("Forbidden", { status: 403 });
            }

            // Look up Telegram integration by denormalized webhookSecret index (O(log n))
            const integration = await ctx.runQuery(internal.integrations.findTelegramByWebhookSecret, {
                rawSecret: secretToken,
            });

            if (!integration) {
                return new Response("Forbidden", { status: 403 });
            }

            const body = await request.json();

            if (!body.message) {
                return new Response("OK", { status: 200 });
            }

            const chatId = String(body.message.chat.id);
            const senderId = String(body.message.from.id);
            const senderName = (body.message.from.first_name + " " + (body.message.from.last_name ?? "")).trim();
            const messageText = body.message.text;
            const messageId = String(body.message.message_id);

            await ctx.runMutation(internal.conversations.createOrUpdateFromTelegram, {
                chatId,
                senderId,
                senderName,
                messageText,
                messageId,
                projectId: integration.projectId,
            });

            return new Response("OK", { status: 200 });
        } catch (error) {
            logger.error("Error processing Telegram webhook", { error: error instanceof Error ? error.message : String(error) });
            // Telegram expects 200 so it doesn't keep retrying relentlessly on simple app errors
            return new Response("OK", { status: 200 });
        }
    }),
});

export default http;
