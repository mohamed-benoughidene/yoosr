/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLogs from "../activityLogs.js";
import type * as analytics from "../analytics.js";
import type * as bots from "../bots.js";
import type * as contacts from "../contacts.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as knowledgeBases from "../knowledgeBases.js";
import type * as members from "../members.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  analytics: typeof analytics;
  bots: typeof bots;
  contacts: typeof contacts;
  conversations: typeof conversations;
  crons: typeof crons;
  http: typeof http;
  integrations: typeof integrations;
  knowledgeBases: typeof knowledgeBases;
  members: typeof members;
  messages: typeof messages;
  profiles: typeof profiles;
  projects: typeof projects;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
