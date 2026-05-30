export type Task = {
  id: string;
  title: string;
  createdAt: string;
};

export type CreateTaskInput = {
  title: string;
};

export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
}

