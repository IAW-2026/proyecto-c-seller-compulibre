import { isAuthorized } from "@/lib/api-auth";
import { getCatalogProducts } from "@/lib/product-catalog";

export async function GET(request: Request) {
  if (!isAuthorized(request, process.env.BUYER_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const catalog = await getCatalogProducts({
    query: searchParams.get("query"),
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

  return Response.json(catalog);
}

export async function POST() {
  return Response.json({ error: "Metodo no permitido" }, { status: 405 });
}
