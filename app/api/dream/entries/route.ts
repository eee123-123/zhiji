import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const filter = searchParams.get("filter");

    // 单条详情查询
    if (id) {
      const entry = await db.dreamEntry.findFirst({
        where: { id, userId },
        include: { tags: true },
      });

      if (!entry) {
        return Response.json({ error: "记录不存在" }, { status: 404 });
      }

      return Response.json({
        id: entry.id,
        content: entry.content,
        tags: entry.tags.map((t) => t.name),
        emotion: entry.emotion,
        clarity: entry.clarity,
        isRecurring: entry.isRecurring,
        traditional: entry.traditional,
        deeper: entry.deeper,
        questions: entry.questions,
        feedback: entry.feedback,
        relatedNote: entry.relatedNote,
        createdAt: entry.createdAt,
      });
    }

    // 列表查询
    const where: Record<string, unknown> = { userId };
    if (filter === "inspired") {
      where.feedback = "inspired";
    }

    const entries = await db.dreamEntry.findMany({
      where,
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    });

    const list = entries.map((entry) => ({
      id: entry.id,
      content: entry.content.slice(0, 50),
      tags: entry.tags.map((t) => t.name),
      emotion: entry.emotion,
      clarity: entry.clarity,
      feedback: entry.feedback,
      createdAt: entry.createdAt,
      traditional: entry.traditional ? entry.traditional.slice(0, 30) : null,
      deeper: entry.deeper ? entry.deeper.slice(0, 30) : null,
    }));

    return Response.json(list);
  } catch (error) {
    console.error("Dream entries GET error:", error);
    return Response.json({ error: "获取记录失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const body = await req.json();
    const { id, feedback, relatedNote } = body;

    if (!id) {
      return Response.json({ error: "缺少记录ID" }, { status: 400 });
    }

    // 验证记录归属
    const existing = await db.dreamEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return Response.json({ error: "记录不存在" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (feedback !== undefined) updateData.feedback = feedback;
    if (relatedNote !== undefined) updateData.relatedNote = relatedNote;

    const updated = await db.dreamEntry.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ success: true, id: updated.id });
  } catch (error) {
    console.error("Dream entries PATCH error:", error);
    return Response.json({ error: "更新失败" }, { status: 500 });
  }
}
