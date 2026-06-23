import { isAuthorized } from "@/lib/api-auth";
import { getSuperadminOrders } from "@/lib/superadmin-catalog";

export async function GET(request: Request) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orders = await getSuperadminOrders({
    query: searchParams.get("query"),
    sellerId: searchParams.get("sellerId"),
    status: searchParams.get("status"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  return Response.json(orders);
}
