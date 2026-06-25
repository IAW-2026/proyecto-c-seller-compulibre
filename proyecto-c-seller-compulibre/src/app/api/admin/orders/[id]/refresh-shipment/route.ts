import { revalidatePath } from "next/cache";

import { isAuthorized } from "@/lib/api-auth";
import {
  ShipmentSyncError,
  syncSellerOrderShipmentStatus,
} from "@/lib/shipment-sync";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request, process.env.SUPERADMIN_API_KEY)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await syncSellerOrderShipmentStatus(id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/ventas");
    revalidatePath(`/dashboard/ventas/${result.orderId}`);

    return Response.json({
      success: true,
      message: result.message,
      order: {
        id: result.orderId,
        trackingId: result.trackingId,
        previousStatus: result.previousStatus,
        status: result.currentStatus,
        updated: result.updated,
      },
    });
  } catch (error) {
    if (error instanceof ShipmentSyncError) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status }
      );
    }

    return Response.json(
      {
        success: false,
        error: "No se pudo actualizar el envio",
      },
      { status: 500 }
    );
  }
}
