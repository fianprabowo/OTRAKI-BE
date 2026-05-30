import { TaskService } from "@/application/taskService";
import { MemoryTaskRepository } from "@/infrastructure/memoryTaskRepository";

const repo = new MemoryTaskRepository();
const service = new TaskService(repo);

export function taskService() {
  return service;
}

