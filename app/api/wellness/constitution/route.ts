import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateConstitution } from "@/lib/wellness/constitution";

// GET: 获取当前用户的体质记录
export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id") || "anonymous";

  try {
    const constitution = await db.constitution.findUnique({
      where: { userId },
    });

    if (!constitution) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        type: constitution.type,
        scores: JSON.parse(constitution.scores),
        createdAt: constitution.createdAt,
        updatedAt: constitution.updatedAt,
      },
    });
  } catch (error) {
    console.error("获取体质记录失败:", error);
    return NextResponse.json(
      { error: "获取体质记录失败" },
      { status: 500 }
    );
  }
}

// POST: 提交问卷结果，计算并保存体质类型
export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id") || "anonymous";

  try {
    const body = await request.json();
    const { answers } = body as { answers: number[] };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "请提供有效的答案数组" },
        { status: 400 }
      );
    }

    // 计算体质结果
    const result = calculateConstitution(answers);

    // upsert: 同一用户只保存一条记录
    const constitution = await db.constitution.upsert({
      where: { userId },
      create: {
        userId,
        type: result.type,
        scores: JSON.stringify(result.scores),
      },
      update: {
        type: result.type,
        scores: JSON.stringify(result.scores),
      },
    });

    return NextResponse.json({
      data: {
        type: constitution.type,
        scores: result.scores,
        createdAt: constitution.createdAt,
        updatedAt: constitution.updatedAt,
      },
    });
  } catch (error) {
    console.error("保存体质记录失败:", error);
    return NextResponse.json(
      { error: "保存体质记录失败" },
      { status: 500 }
    );
  }
}
