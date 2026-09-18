"use client";

import { useSyncExternalStore } from "react";
import { parseStoredTasks } from "@/lib/tasks";
import type { Task } from "@/lib/tasks";

const STORAGE_KEY = "taskwise-tasks";
const EMPTY: Task[] = [];

/*
 * localStorage as an external store. Reading through useSyncExternalStore
 * (instead of load-in-effect + save-in-effect) removes the race where the
 * save effect wrote [] over saved tasks before the load had landed, keeps
 * server and client renders consistent, and syncs the board across tabs.
 */

let cache: Task[] | null = null;
const listeners = new Set<() => void>();

function readTasks(): Task[] {
  if (cache === null) {
    try {
      cache = parseStoredTasks(localStorage.getItem(STORAGE_KEY));
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    cache = null;
    emit();
  }

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function updateTasks(updater: (tasks: Task[]) => Task[]) {
  cache = updater(readTasks());

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }

  emit();
}

export function useTasks() {
  return useSyncExternalStore(subscribe, readTasks, () => EMPTY);
}
