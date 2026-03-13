import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";

export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const maxOrder = await prisma.task.aggregate({
    where: { userId: session.user.id },
    _max: { order: true }
  });

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      tag: parsed.data.tag,
      order: (maxOrder._max.order || 0) + 1
    }
  });

  return NextResponse.json(task, { status: 201 });
}
