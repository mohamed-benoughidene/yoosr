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

  // Translations
  translations: z.object({
    headerTitle: z.string().min(1, "Header title is required").max(100),
    onlineStatus: z.string().max(100),
    startChat: z.string().min(1, "Start chat text is required").max(100),
    welcomeMessage: z.string().min(1, "Welcome message is required").max(500),
    preChatTitle: z.string().min(1, "Pre-chat title is required").max(100),
    preChatSubtitle: z.string().max(500),
  }),
});

export type WidgetConfigForm = z.infer<typeof widgetConfigSchema>;
