// This module is now a no-op since activity logging is handled
// directly via Convex mutations (api.activityLogs.log).
// Keeping this file to avoid breaking imports during migration.
// TODO: Remove this file and update all call sites.

export type ActionType =
    | 'login'
    | 'logout'
    | 'create_project'
    | 'update_project'
    | 'delete_project'
    | 'create_bot'
    | 'update_bot'
    | 'delete_bot'
    | 'create_conversation'
    | 'close_conversation'
    | 'other';

interface LogActivityParams {
    projectId: string;
    actionType: ActionType;
    description: string;
    metadata?: Record<string, any>;
}

export async function logActivity(_params: LogActivityParams) {
    // No-op: Use useMutation(api.activityLogs.log) in components instead.
    console.warn("logActivity() is deprecated. Use Convex mutation api.activityLogs.log instead.");
}
