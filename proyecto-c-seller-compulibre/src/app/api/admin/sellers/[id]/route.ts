import { isAuthorized } from "@/lib/api-auth";
import {
  getSuperadminSellerById,
  updateSuperadminSeller,
} from "@/lib/superadmin-catalog";
import { Prisma } from "@prisma/client";

function getErrorResponse(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return Response.json({ error: "Seller no encontrado" }, { status: 404 });
  }

  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el seller",
    },
    { status: 400 }
  );
}

async function readJsonObject(request: Request) {
  const body = await request.json();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("El body debe ser un objeto JSON");
  }

  return body;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const seller = await getSuperadminSellerById(id);

  if (!seller) {
    return Response.json({ error: "Seller no encontrado" }, { status: 404 });
  }

  return Response.json(seller);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const seller = await updateSuperadminSeller(id, await readJsonObject(request));

    return Response.json(seller);
  } catch (error) {
    return getErrorResponse(error);
  }
}
