import { internalMutation } from "./_generated/server";

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
