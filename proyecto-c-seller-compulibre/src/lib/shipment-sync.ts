import { prisma } from "./prisma";
import { isShippingStatus, SHIPPING_APP_URL } from "./shipping";

export class ShipmentSyncError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ShipmentSyncError";
    this.status = status;
  }
}

export type ShipmentSyncResult = {
  orderId: string;
  trackingId: string;
  previousStatus: string;
  currentStatus: string;
  updated: boolean;
  message: string;
};

async function readShipmentPayload(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "No se pudo consultar el envio en Shipping";

    throw new ShipmentSyncError(message, 502);
  }

  return payload;
}

export async function syncSellerOrderShipmentStatus(
  orderId: string
): Promise<ShipmentSyncResult> {
  const order = await prisma.sellerOrder.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      tracking_id: true,
      status: true,
    },
  });

  if (!order) {
    throw new ShipmentSyncError("Venta no encontrada", 404);
  }

  if (!order.tracking_id) {
    throw new ShipmentSyncError("La venta todavia no tiene un trackingId", 400);
  }

  const sellerApiKey = process.env.SELLER_API_KEY;

  if (!sellerApiKey) {
    throw new ShipmentSyncError("Falta configurar SELLER_API_KEY", 500);
  }

  const response = await fetch(
    `${SHIPPING_APP_URL}/api/shipments/${encodeURIComponent(order.tracking_id)}`,
    {
      headers: {
        "x-api-key": sellerApiKey,
      },
      cache: "no-store",
    }
  );
  const payload = await readShipmentPayload(response);

  if (
    !payload ||
    payload.trackingId !== order.tracking_id ||
    typeof payload.status !== "string" ||
    !isShippingStatus(payload.status)
  ) {
    throw new ShipmentSyncError("Shipping devolvio datos de envio invalidos", 502);
  }

  if (
    typeof payload.externalSellerOrderId === "string" &&
    payload.externalSellerOrderId !== order.id
  ) {
    throw new ShipmentSyncError("Shipping devolvio una orden diferente", 502);
  }

  const updated = payload.status !== order.status;

  if (updated) {
    await prisma.sellerOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: payload.status,
      },
    });
  }

  return {
    orderId: order.id,
    trackingId: order.tracking_id,
    previousStatus: order.status,
    currentStatus: payload.status,
    updated,
    message: updated
      ? "Estado de envio actualizado."
      : "El envio ya estaba actualizado.",
  };
}
