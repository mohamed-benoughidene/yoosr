import { internalMutation, query } from "./_generated/server";

// ONE-TIME MIGRATION — DISABLED. Do not re-enable. See handler comment for details.
export const migrateStatuses = internalMutation({
    args: {},
    handler: async () => {
        // Migration complete as of March 2026 — all conversation statuses are now numeric (100/200/1000).
        // This function has been permanently disabled to prevent accidental re-execution.
        // To confirm: search the conversations table — no record should have typeof status === "string".
        // If you need to re-run data migrations, create a new function in this file.
        throw new Error(
            "migrateStatuses has been disabled. Migration was completed in March 2026."
        );
    },
});

// ONE-TIME MIGRATION: Convert flat widgetConfig.translations to nested per-language structure.
// BEFORE: { headerTitle: "Chat with us", welcomeMessage: "Hi!", ... }
// AFTER:  { headerTitle: { en: "Chat with us", ar: "", fr: "" }, welcomeMessage: { en: "Hi!", ar: "", fr: "" }, ... }
//
// HOW TO RUN (dev instance):
//   1. Deploy: npx convex deploy
//   2. Run:    npx convex run migrations:migrateWidgetTranslations
//   3. Verify: Check a few projects in Convex dashboard — translations should be nested
//   4. This migration is safe to run multiple times (idempotent — skips already-migrated projects)
export const migrateWidgetTranslations = internalMutation({
    args: {},
    handler: async (ctx) => {
        const BATCH_SIZE = 50;
        let migrated = 0;
        let skipped = 0;

        const projects = await ctx.db
            .query("projects")
            .filter((q) => q.neq(q.field("widgetConfig"), undefined))
            .take(BATCH_SIZE);

        for (const project of projects) {
            const config = project.widgetConfig;
            if (!config || !config.translations) {
                skipped++;
                continue;
            }

            const translations = config.translations as Record<string, unknown>;

            // Skip if already migrated (headerTitle is an object, not a string)
            if (typeof translations.headerTitle === "object" && translations.headerTitle !== null) {
                skipped++;
                continue;
            }

            // Convert flat → nested
            const translationFields = [
                "headerTitle",
                "welcomeMessage",
                "onlineStatus",
                "preChatTitle",
                "preChatSubtitle",
                "startChat",
            ];

            const nestedTranslations: Record<string, { en: string; ar: string; fr: string }> = {};

            for (const field of translationFields) {
                const existingValue = translations[field];
                nestedTranslations[field] = {
                    en: typeof existingValue === "string" ? existingValue : "",
                    ar: "",
                    fr: "",
                };
            }

            await ctx.db.patch(project._id, {
                widgetConfig: {
                    ...config,
                    translations: nestedTranslations,
                },
            });

            migrated++;
        }

        return { migrated, skipped, total: projects.length };
    },
});

// Helper query: check migration status
export const checkWidgetTranslationMigrationStatus = query({
    args: {},
    handler: async (ctx) => {
        const BATCH_SIZE = 100;
        let flatCount = 0;
        let nestedCount = 0;
        let noTranslationsCount = 0;

        const projects = await ctx.db
            .query("projects")
            .filter((q) => q.neq(q.field("widgetConfig"), undefined))
            .take(BATCH_SIZE);

        for (const project of projects) {
            const translations = project.widgetConfig?.translations;
            if (!translations) {
                noTranslationsCount++;
                continue;
            }

            const t = translations as Record<string, unknown>;
            if (typeof t.headerTitle === "object" && t.headerTitle !== null) {
                nestedCount++;
            } else {
                flatCount++;
            }
        }

        return {
            total: projects.length,
            flatCount,
            nestedCount,
            noTranslationsCount,
            needsMigration: flatCount > 0,
        };
    },
});
