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
import type * as botFlows from "../botFlows.js";
import type * as bots from "../bots.js";
import type * as cannedResponses from "../cannedResponses.js";
import type * as contacts from "../contacts.js";
import type * as conversations from "../conversations.js";
import type * as cron from "../cron.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as departments from "../departments.js";
import type * as diagnostic from "../diagnostic.js";
import type * as errors from "../errors.js";
import type * as feedback from "../feedback.js";
import type * as getAny from "../getAny.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as knowledge from "../knowledge.js";
import type * as knowledgeBases from "../knowledgeBases.js";
import type * as labels from "../labels.js";
import type * as lib_aiRateLimiter from "../lib/aiRateLimiter.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_embeddings from "../lib/embeddings.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_jsonExtract from "../lib/jsonExtract.js";
import type * as lib_logger from "../lib/logger.js";
import type * as lib_softDelete from "../lib/softDelete.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as openrouter from "../openrouter.js";
import type * as operatingHours from "../operatingHours.js";
import type * as orders from "../orders.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as pushActions from "../pushActions.js";
import type * as pushMutations from "../pushMutations.js";
import type * as routing from "../routing.js";
import type * as seed from "../seed.js";
import type * as tags from "../tags.js";
import type * as types from "../types.js";
import type * as utils from "../utils.js";
import type * as webhooks from "../webhooks.js";
import type * as wipe from "../wipe.js";

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
  botFlows: typeof botFlows;
  bots: typeof bots;
  cannedResponses: typeof cannedResponses;
  contacts: typeof contacts;
  conversations: typeof conversations;
  cron: typeof cron;
  crons: typeof crons;
  dashboard: typeof dashboard;
  departments: typeof departments;
  diagnostic: typeof diagnostic;
  errors: typeof errors;
  feedback: typeof feedback;
  getAny: typeof getAny;
  http: typeof http;
  integrations: typeof integrations;
  knowledge: typeof knowledge;
  knowledgeBases: typeof knowledgeBases;
  labels: typeof labels;
  "lib/aiRateLimiter": typeof lib_aiRateLimiter;
  "lib/auth": typeof lib_auth;
  "lib/crypto": typeof lib_crypto;
  "lib/embeddings": typeof lib_embeddings;
  "lib/env": typeof lib_env;
  "lib/jsonExtract": typeof lib_jsonExtract;
  "lib/logger": typeof lib_logger;
  "lib/softDelete": typeof lib_softDelete;
  messages: typeof messages;
  notifications: typeof notifications;
  openrouter: typeof openrouter;
  operatingHours: typeof operatingHours;
  orders: typeof orders;
  profiles: typeof profiles;
  projects: typeof projects;
  pushActions: typeof pushActions;
  pushMutations: typeof pushMutations;
  routing: typeof routing;
  seed: typeof seed;
  tags: typeof tags;
  types: typeof types;
  utils: typeof utils;
  webhooks: typeof webhooks;
  wipe: typeof wipe;
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

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
