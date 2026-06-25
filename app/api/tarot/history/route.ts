import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 单条详情查询
    if (id) {
      const record = await db.tarotReading.findFirst({
        where: { id, userId },
        select: {
          id: true,
          role: true,
          topic: true,
          description: true,
          spreadType: true,
          cards: true,
          reading: true,
          narrative: true,
          createdAt: true,
        },
      });

      if (!record) {
        return Response.json(
          { error: "NOT_FOUND", message: "记录不存在" },
          { status: 404 }
        );
      }

      return Response.json({
        ...record,
        cards: JSON.parse(record.cards),
      });
    }

    // 列表查询
    const readings = await db.tarotReading.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        topic: true,
        spreadType: true,
        cards: true,
        reading: true,
        createdAt: true,
      },
    });

    const list = readings.map((r) => ({
      id: r.id,
      role: r.role,
      topic: r.topic,
      spreadType: r.spreadType,
      cards: JSON.parse(r.cards),
      readingSummary: r.reading.slice(0, 100),
      createdAt: r.createdAt,
    }));

    return Response.json(list);
  } catch (error: unknown) {
    console.error("History API error:", error);
    return Response.json(
      { error: "INTERNAL_ERROR", message: "获取历史记录失败" },
      { status: 500 }
    );
  }
}
