import { isAuthorized } from "@/lib/api-auth";
import { getSuperadminProducts } from "@/lib/superadmin-catalog";

export async function GET(request: Request) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const products = await getSuperadminProducts({
    query: searchParams.get("query"),
    sellerId: searchParams.get("sellerId"),
    category: searchParams.get("category"),
    condition: searchParams.get("condition"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    sort: searchParams.get("sort"),
    ascendingPrice: searchParams.get("ascendingPrice"),
    descendingPrice: searchParams.get("descendingPrice"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  return Response.json(products);
}
