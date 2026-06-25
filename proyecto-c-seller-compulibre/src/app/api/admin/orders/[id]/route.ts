import { isAuthorized } from "@/lib/api-auth";
import { getSuperadminOrderById } from "@/lib/superadmin-catalog";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getSuperadminOrderById(id);

  if (!order) {
    return Response.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  return Response.json(order);
}
