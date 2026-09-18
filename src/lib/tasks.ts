export const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

export type TaskStatus = (typeof statuses)[number];

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
};

/** Shape returned by the API — the client assigns id, status and timestamp. */
export type GeneratedTask = Pick<Task, "title" | "description">;

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 200;
export const GOAL_MAX = 500;

export const statusMeta: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  TODO: { label: "To do", dot: "bg-todo", text: "text-todo" },
  IN_PROGRESS: { label: "In progress", dot: "bg-progress", text: "text-progress" },
  DONE: { label: "Done", dot: "bg-done", text: "text-done" },
};

export function shiftStatus(status: TaskStatus, step: -1 | 1): TaskStatus | null {
  const next = statuses.indexOf(status) + step;
  return statuses[next] ?? null;
}

function isStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (statuses as readonly string[]).includes(value);
}

/**
 * Validates tasks read from storage. Older versions stored numeric ids, so ids
 * are normalized to strings; anything malformed is dropped instead of crashing
 * the board.
 */
export function parseStoredTasks(raw: string | null): Task[] {
  if (!raw) return [];

  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data.flatMap((item): Task[] => {
      if (typeof item !== "object" || item === null) return [];

      const { id, title, description, status, createdAt } = item as Record<string, unknown>;

      if ((typeof id !== "string" && typeof id !== "number") || typeof title !== "string") {
        return [];
      }

      return [
        {
          id: String(id),
          title: title.slice(0, TITLE_MAX),
          description: typeof description === "string" ? description.slice(0, DESCRIPTION_MAX) : "",
          status: isStatus(status) ? status : "TODO",
          createdAt: typeof createdAt === "string" ? createdAt : new Date(0).toISOString(),
        },
      ];
    });
  } catch {
    return [];
  }
}
