import { revalidatePath } from "next/cache";

import { prisma } from "./prisma";
import { isShippingStatus, type ShippingStatus } from "./shipping";

type ShippingWebhookInput = {
  trackingId: string;
  courier: string;
  sellerId: string;
  status: ShippingStatus;
};

export class ShippingWebhookError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ShippingWebhookError";
    this.status = status;
  }
}

function readRequiredString(body: Record<string, unknown>, field: string) {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new ShippingWebhookError(`${field} es obligatorio`);
  }

  return value.trim();
}

export function parseShippingWebhookPayload(
  payload: unknown
): ShippingWebhookInput {
  if (!payload || typeof payload !== "object") {
    throw new ShippingWebhookError("El body debe ser un objeto JSON");
  }

  const body = payload as Record<string, unknown>;
  const status = readRequiredString(body, "status");

  if (!isShippingStatus(status)) {
    throw new ShippingWebhookError("El status del envio no es valido");
  }

  return {
    trackingId: readRequiredString(body, "trackingId"),
    courier: readRequiredString(body, "courier"),
    sellerId: readRequiredString(body, "sellerId"),
    status,
  };
}

function getShippingNotificationMessage(
  previousStatus: string,
  nextStatus: ShippingStatus
) {
  if (previousStatus === nextStatus && nextStatus === "IN_TRANSIT") {
    return "Tu orden esta mas cerca!";
  }

  if (previousStatus === "LABEL_CREATED" && nextStatus === "IN_TRANSIT") {
    return "Tu orden esta en camino!";
  }

  if (previousStatus === "IN_TRANSIT" && nextStatus === "DELIVERED") {
    return "Tu orden fue entregada con exito!";
  }

  if (nextStatus === "IN_TRANSIT") {
    return "Tu orden esta en camino!";
  }

  if (nextStatus === "DELIVERED") {
    return "Tu orden fue entregada con exito!";
  }

  return "El estado de tu orden fue actualizado.";
}

export async function handleShippingWebhook(
  sellerOrderId: string,
  input: ShippingWebhookInput
) {
  const order = await prisma.sellerOrder.findUnique({
    where: {
      id: sellerOrderId,
    },
    select: {
      id: true,
      seller_id: true,
      tracking_id: true,
      status: true,
    },
  });

  if (!order) {
    throw new ShippingWebhookError("Orden no encontrada", 404);
  }

  if (order.seller_id !== input.sellerId) {
    throw new ShippingWebhookError("El sellerId no coincide con la orden", 403);
  }

  if (order.tracking_id !== input.trackingId) {
    throw new ShippingWebhookError(
      "El trackingId no coincide con la orden",
      409
    );
  }

  const shouldUpdateStatus = order.status !== input.status;
  const shouldCreateNotification = input.status !== "LABEL_CREATED";
  const message = getShippingNotificationMessage(order.status, input.status);

  await prisma.$transaction(async (tx) => {
    if (shouldUpdateStatus) {
      await tx.sellerOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: input.status,
        },
      });
    }

    if (shouldCreateNotification) {
      await tx.notification.create({
        data: {
          seller_id: order.seller_id,
          title: "Actualizacion de envio",
          message,
          href: `/dashboard/ventas/${order.id}`,
        },
      });
    }
  });

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/ventas");
  revalidatePath(`/dashboard/ventas/${order.id}`);

  return { success: true };
}
