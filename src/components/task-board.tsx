"use client";

import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import { RotateCcw } from "lucide-react";
import TaskCard from "@/components/task-card";
import { statusMeta, statuses } from "@/lib/tasks";
import type { Task, TaskStatus } from "@/lib/tasks";
import { cn } from "@/lib/utils";

type TaskBoardProps = {
  tasks: Task[];
  freshIds: ReadonlySet<string>;
  onMove: (id: string, status: TaskStatus) => void;
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

export default function TaskBoard({ tasks, freshIds, onMove, onEdit, onDelete, onClear }: TaskBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const done = tasks.filter((task) => task.status === "DONE").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  // "Clear all" needs a second click within a few seconds.
  useEffect(() => {
    if (!confirmClear) return;
    const timeoutId = setTimeout(() => setConfirmClear(false), 3500);
    return () => clearTimeout(timeoutId);
  }, [confirmClear]);

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    // dragleave also fires when moving onto a child; only reset on a real exit.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOverColumn(null);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault();
    const id = draggedId ?? event.dataTransfer.getData("text/plain");
    if (id) onMove(id, status);
    setDraggedId(null);
    setOverColumn(null);
  }

  return (
    <section aria-labelledby="board-title" className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Board</p>
          <h2 id="board-title" className="mt-3 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
            Your plan
          </h2>
        </div>

        {tasks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-5">
            <div className="min-w-44">
              <div className="flex justify-between font-mono text-[11px] text-faint">
                <span>
                  {done}/{tasks.length} done
                </span>
                <span>{progress}%</span>
              </div>
              <div
                className="mt-2 h-1 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-label="Plan progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-cyan transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => (confirmClear ? (onClear(), setConfirmClear(false)) : setConfirmClear(true))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition",
                confirmClear
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-line-strong bg-surface text-muted hover:text-fg",
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {confirmClear ? "Click again to clear" : "Clear board"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {statuses.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          const meta = statusMeta[status];
          const isOver = overColumn === status;

          return (
            <section
              key={status}
              aria-label={meta.label}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverColumn(status);
              }}
              onDragLeave={handleDragLeave}
              onDrop={(event) => handleDrop(event, status)}
              className={cn(
                "panel flex min-h-40 flex-col rounded-2xl p-3 transition duration-200 md:min-h-72",
                isOver && "border-accent/50 ring-4 ring-accent/10",
              )}
            >
              <header className="flex items-center justify-between px-2 pt-1 pb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden="true" />
                  {meta.label}
                </h3>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                  {columnTasks.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-3">
                {columnTasks.length === 0 ? (
                  <p
                    className={cn(
                      "grid flex-1 place-items-center rounded-xl border border-dashed px-4 py-8 text-center font-mono text-[11px] text-faint transition",
                      isOver ? "border-accent/50 bg-accent/5 text-accent" : "border-line-strong",
                    )}
                  >
                    {isOver ? "Drop here" : status === "TODO" && tasks.length === 0 ? "Generate a plan to begin" : "Nothing here yet"}
                  </p>
                ) : (
                  columnTasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      position={index}
                      fresh={freshIds.has(task.id)}
                      dragging={draggedId === task.id}
                      onMove={onMove}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onDragStart={setDraggedId}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setOverColumn(null);
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
