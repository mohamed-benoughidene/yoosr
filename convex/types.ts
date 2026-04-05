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
