import { isAuthorized } from "@/lib/api-auth";
import { getSuperadminSellers } from "@/lib/superadmin-catalog";

export async function GET(request: Request) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sellers = await getSuperadminSellers({
    query: searchParams.get("query"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  return Response.json(sellers);
}
