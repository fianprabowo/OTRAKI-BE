import { NextResponse } from "next/server";
import { logEvent, logException, withTags } from "@demo/sdk";
import { taskService } from "@/lib/taskContainer";

export async function GET() {
  return withTags({ service: "be", endpoint: "/api/tasks" }, async () => {
    logEvent("be.tasks.list.start", {});

    try {
      const tasks = await taskService().list();
      logEvent("be.tasks.list.success", { count: tasks.length });
      return NextResponse.json({ tasks });
    } catch (err) {
      logException(err, { action: "tasks.list" });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
}

export async function POST(req: Request) {
  return withTags({ service: "be", endpoint: "/api/tasks" }, async () => {
    logEvent("be.tasks.create.start", {});

    try {
      const body = (await req.json()) as { title?: string };
      const task = await taskService().create({ title: body.title ?? "" });
      logEvent("be.tasks.create.success", { id: task.id });
      return NextResponse.json({ task }, { status: 201 });
    } catch (err) {
      logException(err, { action: "tasks.create" });
      const status = err instanceof Error && err.message.includes("required") ? 400 : 500;
      return NextResponse.json({ error: "request_failed" }, { status });
    }
  });
}
