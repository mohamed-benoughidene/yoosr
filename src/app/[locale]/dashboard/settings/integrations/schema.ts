/**
 * Zod schemas for Integration Configuration forms.
 *
 * These schemas validate credentials for various channel integrations:
 * - WhatsApp Business API
 * - Telegram Bot
 * - Messenger
 * - Instagram
 *
 * Usage:
 * ```typescript
 * import { useForm } from "react-hook-form";
 * import { zodResolver } from "@hookform/resolvers/zod";
 * import { whatsappIntegrationSchema, type WhatsAppIntegrationForm } from "./schema";
 *
 * const form = useForm<WhatsAppIntegrationForm>({
 *   resolver: zodResolver(whatsappIntegrationSchema),
 *   defaultValues: { ... }
 * });
 * ```
 */

import { z } from "zod";

/**
 * WhatsApp Business API integration credentials
 */
export const whatsappIntegrationSchema = z.object({
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  accessToken: z.string().optional().default(""), // Empty if reusing existing token
  verifyToken: z.string().min(1, "Verify token is required for webhook verification"),
  appSecret: z.string().optional().default(""), // Empty if reusing existing credential
  enabled: z.boolean().default(false),
});

export type WhatsAppIntegrationForm = z.infer<typeof whatsappIntegrationSchema>;

/**
 * Telegram Bot integration credentials
 */
export const telegramIntegrationSchema = z.object({
  bot_token: z.string().min(1, "Bot token is required").startsWith("Bot token must start with a numeric ID"),
  enabled: z.boolean().default(false),
});

export type TelegramIntegrationForm = z.infer<typeof telegramIntegrationSchema>;

/**
 * Messenger integration credentials
 */
export const messengerIntegrationSchema = z.object({
  page_id: z.string().min(1, "Page ID is required"),
  access_token: z.string().min(1, "Access token is required").startsWith("EAA", "Messenger access tokens must start with 'EAA'"),
  app_secret: z.string().min(1, "App secret is required"),
  enabled: z.boolean().default(false),
});

export type MessengerIntegrationForm = z.infer<typeof messengerIntegrationSchema>;

/**
 * Instagram integration credentials
 */
export const instagramIntegrationSchema = z.object({
  page_id: z.string().min(1, "Account ID is required"),
  access_token: z.string().min(1, "Access token is required").startsWith("EAA", "Instagram access tokens must start with 'EAA'"),
  app_secret: z.string().min(1, "App secret is required"),
  enabled: z.boolean().default(false),
});

export type InstagramIntegrationForm = z.infer<typeof instagramIntegrationSchema>;
