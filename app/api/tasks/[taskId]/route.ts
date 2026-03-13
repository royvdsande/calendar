import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validations";

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(req: Request, { params }: TaskRouteContext) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { taskId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await prisma.task.updateMany({
    where: { id: taskId, userId: session.user.id },
    data: {
      ...parsed.data,
      dueDate:
        parsed.data.dueDate === null
          ? null
          : parsed.data.dueDate
            ? new Date(parsed.data.dueDate)
            : undefined
    }
  });

  if (!updated.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  return NextResponse.json(task);
}

export async function DELETE(_: Request, { params }: TaskRouteContext) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { taskId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deleted = await prisma.task.deleteMany({
    where: { id: taskId, userId: session.user.id }
  });

  if (!deleted.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
