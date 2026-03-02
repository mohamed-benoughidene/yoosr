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
import type * as aiFlowBuilder from "../aiFlowBuilder.js";
import type * as analytics from "../analytics.js";
import type * as bot from "../bot.js";
import type * as botEngine from "../botEngine.js";
import type * as botFlows from "../botFlows.js";
import type * as bots from "../bots.js";
import type * as contacts from "../contacts.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as debug from "../debug.js";
import type * as dev from "../dev.js";
import type * as diagnostic from "../diagnostic.js";
import type * as getAny from "../getAny.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as knowledge from "../knowledge.js";
import type * as knowledgeBases from "../knowledgeBases.js";
import type * as labels from "../labels.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as openrouter from "../openrouter.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as routing from "../routing.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as tags from "../tags.js";
import type * as testQuery from "../testQuery.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  aiFlowBuilder: typeof aiFlowBuilder;
  analytics: typeof analytics;
  bot: typeof bot;
  botEngine: typeof botEngine;
  botFlows: typeof botFlows;
  bots: typeof bots;
  contacts: typeof contacts;
  conversations: typeof conversations;
  crons: typeof crons;
  dashboard: typeof dashboard;
  debug: typeof debug;
  dev: typeof dev;
  diagnostic: typeof diagnostic;
  getAny: typeof getAny;
  http: typeof http;
  integrations: typeof integrations;
  knowledge: typeof knowledge;
  knowledgeBases: typeof knowledgeBases;
  labels: typeof labels;
  messages: typeof messages;
  migrations: typeof migrations;
  notifications: typeof notifications;
  openrouter: typeof openrouter;
  profiles: typeof profiles;
  projects: typeof projects;
  routing: typeof routing;
  seed: typeof seed;
  settings: typeof settings;
  tags: typeof tags;
  testQuery: typeof testQuery;
  webhooks: typeof webhooks;
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
