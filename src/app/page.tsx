"use client";

/* ===================== */
/* Imports */
/* ===================== */

import { useEffect, useState } from "react";
import TypingText from "@/components/TypingText";

/* ===================== */
/* Types */
/* Defines the structure of each task inside the system.
 */
/* ===================== */

type Task = {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  createdAt: string;
};

/* ===================== */
/* Columns Config */
/* Controls the board columns and their visual identity.
 */
/* ===================== */

const columns = [
  {
    title: "To Do",
    status: "TODO",
    titleClass: "column-todo",
  },
  {
    title: "In Progress",
    status: "IN_PROGRESS",
    titleClass: "column-progress",
  },
  {
    title: "Done",
    status: "DONE",
    titleClass: "column-done",
  },
] as const;

/* ===================== */
/* Home Page */
/* AI prompt is placed inside the header to keep the board focused.
 */
/* ===================== */

export default function Home() {
  /* ===================== */
  /* State Management */
  /* ===================== */

  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  /* ===================== */
  /* Load Tasks from LocalStorage */
  /* Runs once when the app loads.
   */
  /* ===================== */

  useEffect(() => {
    const saved = localStorage.getItem("taskwise-tasks");

    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        console.error("Failed to parse stored tasks");
      }
    }
  }, []);

  /* ===================== */
  /* Save Tasks to LocalStorage */
  /* Runs every time tasks change.
   */
  /* ===================== */

  useEffect(() => {
    localStorage.setItem("taskwise-tasks", JSON.stringify(tasks));
  }, [tasks]);

  /* ===================== */
  /* Generate Tasks from AI */
  /* Calls the API route and adds generated tasks to the board.
   */
  /* ===================== */

  async function handleGeneratePlan(event: React.FormEvent) {
    event.preventDefault();

    if (!goal.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();

      const newTasks: Task[] = (data.tasks || []).map(
        (task: Task, index: number) => ({
          id: Date.now() + index,
          title: task.title,
          description: task.description,
          status: "TODO",
          createdAt: new Date().toISOString(),
        }),
      );

      setTasks((prev) => [...newTasks, ...prev]);
      setSource(data.source || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /* ===================== */
  /* Status Change */
  /* Moves a task through TODO -> IN_PROGRESS -> DONE -> TODO.
   */
  /* ===================== */

  function handleStatusChange(id: number) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;

        const nextStatus =
          task.status === "TODO"
            ? "IN_PROGRESS"
            : task.status === "IN_PROGRESS"
              ? "DONE"
              : "TODO";

        return { ...task, status: nextStatus };
      }),
    );
  }

  /* ===================== */
  /* Delete Task */
  /* Runs a small delete animation before removing the task.
   */
  /* ===================== */

  function handleDelete(id: number) {
    setDeletingId(id);

    setTimeout(() => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setDeletingId(null);
    }, 200);
  }

  /* ===================== */
  /* Clear All Tasks */
  /* Removes every task from the board.
   */
  /* ===================== */

  function handleClearAll() {
    setTasks([]);
  }

  /* ===================== */
  /* Edit Task */
  /* Starts, saves, or cancels inline editing.
   */
  /* ===================== */

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  }

  function saveEdit() {
    if (!editTitle.trim()) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingId
          ? { ...task, title: editTitle, description: editDesc }
          : task,
      ),
    );

    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  /* ===================== */
  /* Drag & Drop Handlers */
  /* Controls which task is dragged and where it gets dropped.
   */
  /* ===================== */

  function handleDragStart(task: Task) {
    setDraggedTask(task);
  }

  function handleDrop(status: Task["status"]) {
    if (!draggedTask) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTask.id ? { ...task, status } : task,
      ),
    );

    setDraggedTask(null);
    setDragOverColumn(null);
  }

  /* ===================== */
  /* UI Rendering */
  /* ===================== */

  return (
    <main className="app-container">
      {/* ===================== */}
      {/* Header + AI Prompt */}
      {/* ===================== */}

      <header className="hero-header animate-fade-up">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">
            AI PRODUCTIVITY SYSTEM
          </p>

          <h1 className="app-title mt-3">Taskwise AI</h1>
        </div>

        <div className="glass-card header-prompt-card">
          <form onSubmit={handleGeneratePlan} className="goal-form">
            <div className="ai-prompt-field">
              <label className="goal-label">Your Goal</label>

              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="ai-prompt-textarea"
                placeholder="Example: Create a 10-step plan..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="generate-button flex items-center justify-center gap-2"
            >
              {loading && <div className="loader" />}
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </form>
        </div>
      </header>

      {/* ===================== */}
      {/* Task Board Section */}
      {/* ===================== */}

      <section className="ai-board-section">
        <div className="ai-board-header">
          <div>
            <h2 className="section-title">Generated Plan</h2>

            <p className="section-subtitle">
              Your AI-generated tasks are organized by status.
            </p>

            {source && <p className="source-badge">Source: {source}</p>}
          </div>

          {tasks.length > 0 ? (
            <div className="board-actions">
              <button
                type="button"
                onClick={handleClearAll}
                className="clear-all-button"
              >
                Clear All
              </button>
            </div>
          ) : null}
        </div>

        <div className="task-board">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status,
            );

            return (
              <div
                key={column.status}
                className={`task-column-box ${
                  dragOverColumn === column.status ? "column-active" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverColumn(column.status);
                }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(column.status)}
              >
                <div className="task-column-header">
                  <h3 className={`task-column-title ${column.titleClass}`}>
                    {column.title}
                  </h3>

                  <span className="task-column-count">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="task-column">
                  {columnTasks.length === 0 ? (
                    <div className="empty-column-state">No tasks here yet.</div>
                  ) : (
                    columnTasks.map((task, index) => {
                      const glowClass =
                        task.status === "TODO"
                          ? "glow-todo"
                          : task.status === "IN_PROGRESS"
                            ? "glow-progress"
                            : "glow-done";

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onClick={() => handleStatusChange(task.id)}
                          className={`task-card task-enter ${
                            deletingId === task.id ? "task-deleting" : ""
                          } ${
                            draggedTask?.id === task.id ? "task-dragging" : ""
                          }`}
                          style={{
                            animationDelay: `${index * 0.18}s`,
                          }}
                        >
                          {editingId === task.id ? (
                            <div
                              onClick={(event) => event.stopPropagation()}
                              className="w-full"
                            >
                              <input
                                value={editTitle}
                                onChange={(event) =>
                                  setEditTitle(event.target.value)
                                }
                                className="task-card-title w-full bg-transparent outline-none"
                                maxLength={35}
                              />

                              <textarea
                                value={editDesc}
                                onChange={(event) =>
                                  setEditDesc(event.target.value)
                                }
                                className="mt-4 w-full resize-none rounded-2xl border border-[var(--border)] bg-black/20 p-3 text-white outline-none"
                                rows={3}
                                maxLength={120}
                              />

                              <div className="task-card-actions mt-4">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    saveEdit();
                                  }}
                                  className="modal-blue-btn"
                                >
                                  Save
                                </button>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    cancelEdit();
                                  }}
                                  className="modal-red-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className={`task-glow ${glowClass}`} />

                              <h3 className="task-title">
                                <TypingText
                                  text={task.title}
                                  speed={20}
                                  delay={index * 180}
                                />
                              </h3>

                              <p className="task-description">
                                <TypingText
                                  text={task.description}
                                  speed={12}
                                  delay={index * 180 + 400}
                                />
                              </p>

                              <div className="task-card-actions mt-4">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    startEdit(task);
                                  }}
                                  className="task-action-edit"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDelete(task.id);
                                  }}
                                  className="task-action-delete"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
