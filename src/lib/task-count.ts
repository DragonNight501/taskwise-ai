const DEFAULT_COUNT = 8;
const MIN_COUNT = 3;
const MAX_COUNT = 20;

// A number only counts when it is followed by a unit — "10 steps", "10-step",
// "5 Aufgaben", "7 خطوات". A bare number ("in 2026", "B2", "5 kg") is part of
// the goal, and durations ("in 30 days") are a deadline, not a task count.
const COUNT_PATTERN =
  /(\d{1,2})\s*-?\s*(?:steps?|tasks?|milestones?|schritte?n?|aufgaben?|خطوات|خطوة|مهام|مهمة)(?![\p{L}])/iu;

export function detectTaskCount(goal: string) {
  const match = goal.match(COUNT_PATTERN);
  if (!match) return DEFAULT_COUNT;

  return Math.min(Math.max(Number(match[1]), MIN_COUNT), MAX_COUNT);
}
