"use client";

import { useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Pencil, Trash2, X } from "lucide-react";
import TypingText from "@/components/typing-text";
import { DESCRIPTION_MAX, TITLE_MAX, shiftStatus, statusMeta } from "@/lib/tasks";
import type { Task, TaskStatus } from "@/lib/tasks";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: Task;
  position: number;
  fresh: boolean;
  dragging: boolean;
  onMove: (id: string, status: TaskStatus) => void;
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

const iconButton =
  "grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30";

export default function TaskCard({
  task,
  position,
  fresh,
  dragging,
  onMove,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftDescription, setDraftDescription] = useState(task.description);
  const [leaving, setLeaving] = useState(false);

  const previous = shiftStatus(task.status, -1);
  const next = shiftStatus(task.status, 1);

  function startEdit() {
    setDraftTitle(task.title);
    setDraftDescription(task.description);
    setEditing(true);
  }

  function save() {
    const title = draftTitle.trim();
    if (!title) return;
    onEdit(task.id, title, draftDescription.trim());
    setEditing(false);
  }

  function handleEditKeys(event: KeyboardEvent) {
    if (event.key === "Escape") setEditing(false);
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) save();
  }

  function remove() {
    setLeaving(true);
    setTimeout(() => onDelete(task.id), 180);
  }

  function handleDragStart(event: DragEvent) {
    // Firefox only starts a drag when some data is set.
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
    onDragStart(task.id);
  }

  return (
    <article
      draggable={!editing}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={fresh ? { animationDelay: `${position * 90}ms` } : undefined}
      className={cn(
        "group card relative rounded-xl p-4 transition duration-200",
        !editing && "cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:border-line-strong",
        fresh && "animate-[rise_0.6s_cubic-bezier(0.22,1,0.36,1)_both]",
        dragging && "opacity-40",
        leaving && "scale-95 opacity-0",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-tight text-faint">
          #{String(position + 1).padStart(2, "0")}
        </span>
        <span
          className={cn("h-1.5 w-1.5 rounded-full", statusMeta[task.status].dot)}
          aria-hidden="true"
        />
      </div>

      {editing ? (
        <div className="mt-3 space-y-2" onKeyDown={handleEditKeys}>
          <label className="sr-only" htmlFor={`title-${task.id}`}>
            Task title
          </label>
          <input
            id={`title-${task.id}`}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && save()}
            maxLength={TITLE_MAX}
            autoFocus
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-accent/60"
          />
          <label className="sr-only" htmlFor={`description-${task.id}`}>
            Task description
          </label>
          <textarea
            id={`description-${task.id}`}
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            maxLength={DESCRIPTION_MAX}
            rows={3}
            className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted outline-none focus:border-accent/60"
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={!draftTitle.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-void px-3 py-1.5 text-xs font-medium text-white transition hover:bg-void-2 disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" /> Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-muted transition hover:text-fg"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="mt-2 font-medium leading-snug tracking-tight">
            {fresh ? <TypingText text={task.title} delay={position * 90} speed={18} /> : task.title}
          </h4>
          {task.description ? (
            <p className="mt-1.5 text-sm leading-6 text-muted">
              {fresh ? (
                <TypingText text={task.description} delay={position * 90 + 300} speed={8} />
              ) : (
                task.description
              )}
            </p>
          ) : null}

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
            <div className="flex items-center">
              <button
                type="button"
                className={iconButton}
                disabled={!previous}
                onClick={() => previous && onMove(task.id, previous)}
                aria-label={previous ? `Move "${task.title}" to ${statusMeta[previous].label}` : "Already in the first column"}
                title={previous ? `Move to ${statusMeta[previous].label}` : undefined}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={iconButton}
                disabled={!next}
                onClick={() => next && onMove(task.id, next)}
                aria-label={next ? `Move "${task.title}" to ${statusMeta[next].label}` : "Already in the last column"}
                title={next ? `Move to ${statusMeta[next].label}` : undefined}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                className={iconButton}
                onClick={startEdit}
                aria-label={`Edit "${task.title}"`}
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={cn(iconButton, "hover:bg-red-50 hover:text-red-600")}
                onClick={remove}
                aria-label={`Delete "${task.title}"`}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
