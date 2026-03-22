export const FREE_PLAN_LIMITS = {
  conversations: 500,
  bots: 3,
  knowledgeBases: 2,
  seats: 5,
} as const;

export type PlanLimits = typeof FREE_PLAN_LIMITS;
