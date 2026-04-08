/**
 * Zod schema for the Widget Settings form.
 *
 * This schema validates all widget configuration fields including:
 * - Appearance (primary color, logo URL)
 * - Behavior (delays, toggles, contact method)
 * - Translations (text labels)
 *
 * Usage:
 * ```typescript
 * import { useForm } from "react-hook-form";
 * import { zodResolver } from "@hookform/resolvers/zod";
 * import { widgetConfigSchema, type WidgetConfigForm } from "./schema";
 *
 * const form = useForm<WidgetConfigForm>({
 *   resolver: zodResolver(widgetConfigSchema),
 *   defaultValues: { ... }
 * });
 * ```
 */

import { z } from "zod";

// Per-language translation entry
const translationEntry = z.object({
  en: z.string().max(500),
  ar: z.string().max(500),
  fr: z.string().max(500),
});

export const widgetConfigSchema = z.object({
  // Appearance
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Primary color must be a valid hex color (e.g., #6366f1)"),
  align: z.enum(["left", "right"]),
  logoUrl: z.string().url("Logo URL must be a valid URL").or(z.literal("")),

  // Behavior
  welcomeDelay: z.number().min(0).max(60),
  enableWelcomeNotification: z.boolean(),
  autoCloseMinutes: z.number().min(0).max(1440),
  preChatFormEnabled: z.boolean(),
  contactMethod: z.enum(["email", "phone"]),

  // Translations — nested per-language
  translations: z.object({
    headerTitle: translationEntry.refine(
      (entry) => entry.en.length > 0,
      { message: "Header title (English) is required", path: ["en"] }
    ),
    welcomeMessage: translationEntry.refine(
      (entry) => entry.en.length > 0,
      { message: "Welcome message (English) is required", path: ["en"] }
    ),
    onlineStatus: translationEntry,
    startChat: translationEntry.refine(
      (entry) => entry.en.length > 0,
      { message: "Start chat text (English) is required", path: ["en"] }
    ),
    preChatTitle: translationEntry.refine(
      (entry) => entry.en.length > 0,
      { message: "Pre-chat title (English) is required", path: ["en"] }
    ),
    preChatSubtitle: translationEntry,
  }),
});

export type WidgetConfigForm = z.infer<typeof widgetConfigSchema>;

// Helper: create empty translation entry with all locales as empty strings
export const emptyTranslationEntry = (): { en: string; ar: string; fr: string } => ({
  en: "",
  ar: "",
  fr: "",
});

// Helper: create default translations with English values
export const defaultTranslations = (): WidgetConfigForm["translations"] => ({
  headerTitle: { en: "Chat with us", ar: "", fr: "Discutez avec nous" },
  welcomeMessage: { en: "Hi! How can we help you today?", ar: "", fr: "Bonjour! Comment pouvons-nous vous aider?" },
  onlineStatus: { en: "Online", ar: "", fr: "En ligne" },
  startChat: { en: "Start Chat", ar: "", fr: "Démarrer le chat" },
  preChatTitle: { en: "Welcome", ar: "", fr: "Bienvenue" },
  preChatSubtitle: { en: "Please fill in your details to start a conversation.", ar: "", fr: "Veuillez remplir vos coordonnées pour démarrer une conversation." },
});
