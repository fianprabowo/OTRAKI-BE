import type { CreateTaskInput, Task, TaskRepository } from "@/domain/task";

export class TaskService {
  constructor(private readonly repo: TaskRepository) {}

  async list(): Promise<Task[]> {
    return this.repo.list();
  }

  async create(input: CreateTaskInput): Promise<Task> {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("title is required");
    }
    return this.repo.create({ title: input.title.trim() });
  }
}

