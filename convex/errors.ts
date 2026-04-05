/**
 * Shared error helpers for Convex functions.
 *
 * Standardizes error throwing across all Convex functions so clients
 * receive consistent error shapes.
 *
 * Rule:
 * - User-facing errors (auth denial, validation failures, not found):
 *   throw ConvexError with a user-safe message
 * - Internal/developer errors (programming mistakes, invariant violations):
 *   throw Error
 *
 * @see https://docs.convex.io/functions/error-handling
 */

import { ConvexError } from "convex/values";

/**
 * User-facing error for validation failures or business logic errors.
 * @param message - A user-safe error message
 */
export function userError(message: string): ConvexError<string> {
  return new ConvexError(message);
}

/**
 * User-facing error for authentication failures.
 * Thrown when the user is not authenticated.
 */
export function authError(): ConvexError<string> {
  return new ConvexError("Unauthorized");
}

/**
 * User-facing error for resource not found.
 * @param resource - The type of resource that was not found (e.g., "Project", "Contact")
 */
export function notFoundError(resource: string): ConvexError<string> {
  return new ConvexError(`${resource} not found`);
}

/**
 * User-facing error for authorization failures.
 * Thrown when the user is authenticated but lacks permission.
 */
export function forbiddenError(): ConvexError<string> {
  return new ConvexError("Forbidden");
}
