/**
 * Shared type definitions for the Convex backend.
 *
 * These types are used across multiple Convex functions to ensure consistency
 * and reduce maintenance burden when upstream types change.
 */

/**
 * Clerk JWT identity claims extended with custom org claims.
 *
 * This type represents the identity object returned by Clerk after
 * authentication. It includes standard JWT claims plus custom claims
 * added via Clerk JWT templates for multi-tenant org support.
 *
 * @field subject - The Clerk user ID (e.g., "user_2abc...")
 * @field org_id - The active organization/project ID (Clerk org ID string)
 * @field org_role - The user's role within the active org (e.g., "org:admin")
 *
 * @see https://clerk.com/docs/organizations/overview
 * @see https://clerk.com/docs/backend-requests/resources/session-tokens
 */
export type ClerkIdentity = {
  subject: string;
  org_id?: string;
  org_role?: string;
  [key: string]: unknown;
};

// ============================================================
// Conversation status codes
// These match the values in the Convex schema (conversations.status)
// ============================================================

/**
 * Conversation status codes used throughout the application.
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

/** Type guard for status validation */
export function isConversationStatus(value: unknown): value is ConversationStatus {
    return Object.values(CONVERSATION_STATUS).includes(value as ConversationStatus);
}
