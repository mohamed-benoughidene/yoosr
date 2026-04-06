/**
 * Shared constants for the frontend.
 * These match the values defined in convex/types.ts (CONVERSATION_STATUS).
 */

/**
 * Conversation status codes — kept in sync with the Convex schema.
 * - UNASSIGNED (100): New conversation, no agent assigned
 * - ASSIGNED (200): Conversation assigned to an agent
 * - CLOSED (1000): Conversation resolved/closed
 */
export const CONVERSATION_STATUS = {
    UNASSIGNED: 100,
    ASSIGNED: 200,
    CLOSED: 1000,
} as const;

export type ConversationStatus = typeof CONVERSATION_STATUS[keyof typeof CONVERSATION_STATUS];
