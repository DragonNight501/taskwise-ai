"use client";

import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { CornerDownLeft, LoaderCircle, Sparkles } from "lucide-react";
import { GOAL_MAX } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const examples = [
  "Launch a personal portfolio website in 8 steps",
  "Prepare for a technical job interview",
  "Learn the fundamentals of computer networks",
];

type GoalComposerProps = {
  loading: boolean;
  onGenerate: (goal: string) => void;
};

export default function GoalComposer({ loading, onGenerate }: GoalComposerProps) {
  const [goal, setGoal] = useState("");
  const trimmed = goal.trim();
  const canSubmit = trimmed.length > 0 && !loading;

  function submit() {
    if (canSubmit) onGenerate(trimmed);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter generates, Shift+Enter adds a line; never interrupt IME composition.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel relative overflow-hidden rounded-2xl">
      {loading ? (
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
          aria-hidden="true"
        >
          <span className="block h-full w-1/3 animate-[scan_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent to-transparent" />
        </span>
      ) : null}

      <div className="flex items-center justify-between border-b border-line bg-surface-2/60 px-5 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
        </div>
        <span className="font-mono text-[11px] tracking-tight text-faint">new-plan.prompt</span>
      </div>

      <div className="p-5">
        <label
          htmlFor="goal"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent"
        >
          Your goal
        </label>

        <textarea
          id="goal"
          name="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={GOAL_MAX}
          rows={4}
          placeholder="e.g. Launch my portfolio website in 8 steps"
          className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] leading-7 text-fg outline-none transition placeholder:text-faint focus:border-accent/60"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setGoal(example)}
              className="rounded-md bg-surface-2 px-2.5 py-1 text-left text-xs text-muted transition hover:bg-accent/10 hover:text-accent"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-[11px] text-faint">
            <span className={cn(goal.length > GOAL_MAX * 0.9 && "text-todo")}>
              {goal.length}/{GOAL_MAX}
            </span>
            <span aria-hidden="true">·</span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <CornerDownLeft className="h-3 w-3" /> to generate
            </span>
          </p>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-void px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_-14px_rgb(10_12_18/0.9)] transition hover:bg-void-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating…" : "Generate plan"}
          </button>
        </div>
      </div>
    </form>
  );
}
