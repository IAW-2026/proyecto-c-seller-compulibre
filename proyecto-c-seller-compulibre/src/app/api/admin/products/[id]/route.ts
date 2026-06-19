import { isAuthorized } from "@/lib/api-auth";
import {
  deleteSuperadminProduct,
  getSuperadminProductById,
  updateSuperadminProduct,
} from "@/lib/superadmin-catalog";
import { Prisma } from "@prisma/client";

function getErrorResponse(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    return Response.json(
      {
        error:
          "No se puede eliminar el producto porque esta asociado a una orden",
      },
      { status: 409 }
    );
  }

  return Response.json(
    {
      error: error instanceof Error ? error.message : fallbackMessage,
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
  const product = await getSuperadminProductById(id);

  if (!product) {
    return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return Response.json(product);
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
    const product = await updateSuperadminProduct(
      id,
      await readJsonObject(request)
    );

    return Response.json(product);
  } catch (error) {
    return getErrorResponse(error, "No se pudo actualizar el producto");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await deleteSuperadminProduct(id);

    return Response.json(product);
  } catch (error) {
    return getErrorResponse(error, "No se pudo eliminar el producto");
  }
}
