import { isAuthorized } from "@/lib/api-auth";
import { getCatalogProductById } from "@/lib/product-catalog";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request, process.env.BUYER_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getCatalogProductById(id);

  if (!product) {
    return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return Response.json(product);
}
