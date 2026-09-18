"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import GoalComposer from "@/components/goal-composer";
import TaskBoard from "@/components/task-board";
import { updateTasks, useTasks } from "@/hooks/use-tasks";
import type { GeneratedTask, Task, TaskStatus } from "@/lib/tasks";

type Notice = { tone: "success" | "warning" | "error"; text: string };

const modelNames: Record<string, string> = {
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.5-flash-lite": "Gemini 2.5 Flash-Lite",
};

const errorMessages: Record<string, string> = {
  rate_limited: "You have generated a lot of plans in a short time. Please try again in a few minutes.",
  goal_required: "Describe your goal first.",
  goal_too_long: "That goal is too long. Please shorten it to 500 characters.",
  invalid_request: "The request could not be read. Please try again.",
};

const noticeStyles = {
  success: "border-done/25 bg-done/5 text-done",
  warning: "border-todo/30 bg-todo/5 text-todo",
  error: "border-red-300 bg-red-50 text-red-700",
};

export default function TaskwiseApp({ intro }: { intro: ReactNode }) {
  const tasks = useTasks();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(new Set());

  async function generate(goal: string) {
    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      const data: { code?: string; source?: string; tasks?: GeneratedTask[] } = await response.json();

      if (!response.ok || !data.tasks?.length) {
        setNotice({
          tone: "error",
          text: errorMessages[data.code ?? ""] ?? "Something went wrong while generating the plan. Please try again.",
        });
        return;
      }

      const createdAt = new Date().toISOString();
      const newTasks: Task[] = data.tasks.map((task) => ({
        id: crypto.randomUUID(),
        title: task.title,
        description: task.description,
        status: "TODO",
        createdAt,
      }));

      updateTasks((previous) => [...newTasks, ...previous]);
      setFreshIds(new Set(newTasks.map((task) => task.id)));

      setNotice(
        data.source === "template"
          ? {
              tone: "warning",
              text: "The AI service is unavailable right now, so this is a starter template. Edit the tasks to fit your goal.",
            }
          : {
              tone: "success",
              text: `${newTasks.length} tasks drafted by ${modelNames[data.source ?? ""] ?? "Gemini"}.`,
            },
      );
    } catch {
      setNotice({
        tone: "error",
        text: "Could not reach the server. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function moveTask(id: string, status: TaskStatus) {
    updateTasks((previous) => previous.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  function editTask(id: string, title: string, description: string) {
    updateTasks((previous) =>
      previous.map((task) => (task.id === id ? { ...task, title, description } : task)),
    );
  }

  function deleteTask(id: string) {
    updateTasks((previous) => previous.filter((task) => task.id !== id));
  }

  function clearBoard() {
    updateTasks(() => []);
    setNotice(null);
  }

  return (
    <>
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr]">
        {intro}

        <div className="lg:pt-6">
          <GoalComposer loading={loading} onGenerate={generate} />

          <div aria-live="polite" className="min-h-0">
            {notice ? (
              <p
                role={notice.tone === "error" ? "alert" : "status"}
                className={`mt-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-6 ${noticeStyles[notice.tone]}`}
              >
                {notice.tone === "success" ? (
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {notice.text}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <TaskBoard
        tasks={tasks}
        freshIds={freshIds}
        onMove={moveTask}
        onEdit={editTask}
        onDelete={deleteTask}
        onClear={clearBoard}
      />
    </>
  );
}
