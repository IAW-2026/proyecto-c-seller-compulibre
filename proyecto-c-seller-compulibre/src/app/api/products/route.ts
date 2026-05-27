import { isAuthorized } from "@/lib/api-auth";
import { getCatalogProducts } from "@/lib/product-catalog";

export async function GET(request: Request) {
  if (!isAuthorized(request, process.env.BUYER_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const products = await getCatalogProducts();
  return Response.json(products);
}

export async function POST() {
  return Response.json({ error: "Metodo no permitido" }, { status: 405 });
}
