import { getDreamPatternStats } from "@/lib/dream/patterns";

export async function GET() {
  try {
    const stats = await getDreamPatternStats();
    return Response.json(stats);
  } catch (error) {
    console.error("Failed to get dream pattern stats:", error);
    return Response.json(
      { error: "获取梦境模式数据失败" },
      { status: 500 }
    );
  }
}
