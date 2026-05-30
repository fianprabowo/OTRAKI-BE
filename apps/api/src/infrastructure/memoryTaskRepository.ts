import type { CreateTaskInput, Task, TaskRepository } from "@/domain/task";

const store: Task[] = [];

function newId() {
  if ("crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class MemoryTaskRepository implements TaskRepository {
  async list(): Promise<Task[]> {
    return [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: newId(),
      title: input.title,
      createdAt: new Date().toISOString(),
    };
    store.unshift(task);
    return task;
  }
}

