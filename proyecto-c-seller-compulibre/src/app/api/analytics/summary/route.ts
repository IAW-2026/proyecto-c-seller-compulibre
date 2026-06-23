import { isAuthorized } from "@/lib/api-auth";
import { getAnalyticsSummary } from "@/lib/analytics-summary";

export async function GET(request: Request) {
  if (!isAuthorized(request, process.env.ANALYTICS_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const summary = await getAnalyticsSummary();

  return Response.json(summary);
}
