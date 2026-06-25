import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// GET: 获取用户的打卡记录
export async function GET(req: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (date) {
      // 查询指定日期
      const checkins = await db.wellnessCheckin.findMany({
        where: { userId, date },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(checkins);
    }

    // 默认返回最近 30 天
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const checkins = await db.wellnessCheckin.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(checkins);
  } catch (error) {
    console.error("获取打卡记录失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// POST: 创建打卡记录
export async function POST(req: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const { type, content } = await req.json();

    if (!type || !content) {
      return NextResponse.json(
        { error: "类型和内容不能为空" },
        { status: 400 }
      );
    }

    const date = new Date().toISOString().split("T")[0];

    // upsert：同一天同一类型不重复创建
    const checkin = await db.wellnessCheckin.upsert({
      where: {
        userId_date_type: { userId, date, type },
      },
      update: { content },
      create: {
        userId,
        date,
        type,
        content,
      },
    });

    return NextResponse.json(checkin);
  } catch (error) {
    console.error("打卡失败:", error);
    return NextResponse.json({ error: "打卡失败" }, { status: 500 });
  }
}

// PATCH: 更新体感反馈
export async function PATCH(req: NextRequest) {
  try {
    const { id, feedback } = await req.json();

    if (!id || !feedback) {
      return NextResponse.json(
        { error: "ID和反馈不能为空" },
        { status: 400 }
      );
    }

    const validFeedback = ["better", "normal", "none"];
    if (!validFeedback.includes(feedback)) {
      return NextResponse.json(
        { error: "无效的反馈类型" },
        { status: 400 }
      );
    }

    const checkin = await db.wellnessCheckin.update({
      where: { id },
      data: { feedback },
    });

    return NextResponse.json(checkin);
  } catch (error) {
    console.error("更新反馈失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
