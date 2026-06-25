import { getCurrentSolarTerm } from "@/lib/solar-terms";

export async function GET() {
  const term = getCurrentSolarTerm();
  return Response.json(term);
}
