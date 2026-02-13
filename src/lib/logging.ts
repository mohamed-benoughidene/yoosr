import { createClient } from "@/lib/supabase/client";

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

export async function logActivity({ projectId, actionType, description, metadata = {} }: LogActivityParams) {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                project_id: projectId,
                action_type: actionType,
                description,
                metadata
            });

        if (error) {
            console.error("Failed to log activity:", error);
        }
    } catch (err) {
        console.error("Error logging activity:", err);
    }
}
