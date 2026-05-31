"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminUser, requireAdminUser, requireDashboardUser } from "./auth";
import { prisma } from "./prisma";
import {
  isShippingCourier,
  isShippingStatus,
  SHIPPING_APP_URL,
  type ShippingCourier,
} from "./shipping";

export type RegisterShipmentState = {
  status: "idle" | "error";
  message: string;
};

export type RefreshShipmentState = {
  status: "idle" | "success" | "error";
  message: string;
};

function readCourier(formData: FormData): ShippingCourier {
  const value = formData.get("courier");

  if (typeof value !== "string" || !isShippingCourier(value)) {
    throw new Error("El courier seleccionado no es valido");
  }

  return value;
}

function readExternalTrackingId(formData: FormData) {
  const value = formData.get("externalTrackingId");

  if (typeof value !== "string" || !value.trim()) {
    throw new Error("El codigo de seguimiento es obligatorio");
  }

  const externalTrackingId = value.trim();

  if (externalTrackingId.length > 80) {
    throw new Error("El codigo de seguimiento no puede superar 80 caracteres");
  }

  return externalTrackingId;
}

async function readShippingResponse(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "No se pudo registrar el despacho en Shipping";

    throw new Error(message);
  }

  if (!payload || typeof payload.trackingId !== "string") {
    throw new Error("Shipping no devolvio un trackingId valido");
  }

  return {
    trackingId: payload.trackingId,
    status: typeof payload.status === "string" ? payload.status : undefined,
  };
}

export async function registerShipmentFromForm(
  saleId: string,
  _state: RegisterShipmentState,
  formData: FormData
): Promise<RegisterShipmentState> {
  try {
    const user = await requireDashboardUser();
    const isAdmin = isAdminUser(user);
    const courier = readCourier(formData);
    const externalTrackingId = readExternalTrackingId(formData);

    const order = await prisma.sellerOrder.findFirst({
      where: isAdmin
        ? { id: saleId }
        : {
            id: saleId,
            seller_id: user.id,
          },
      include: {
        seller: true,
      },
    });

    if (!order) {
      throw new Error("Venta no encontrada");
    }

    if (order.tracking_id) {
      throw new Error("El producto ya se despacho");
    }

    if (!order.buyer_id) {
      throw new Error("La venta no tiene comprador asociado");
    }

    if (!order.buyer_address) {
      throw new Error("La venta no tiene direccion de comprador");
    }

    if (!order.seller.seller_address) {
      throw new Error("Configura la direccion de tu tienda antes de despachar");
    }

    const sellerApiKey = process.env.SELLER_API_KEY;

    if (!sellerApiKey) {
      throw new Error("Falta configurar SELLER_API_KEY");
    }

    const response = await fetch(`${SHIPPING_APP_URL}/api/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": sellerApiKey,
      },
      body: JSON.stringify({
        sellerOrderId: order.id,
        buyerOrderId: order.external_buyer_order_id,
        sellerId: order.seller_id,
        courier,
        externalTrackingId,
        buyerAddress: order.buyer_address,
        originAddress: order.seller.seller_address,
      }),
    });
    const shipment = await readShippingResponse(response);

    await prisma.sellerOrder.update({
      where: {
        id: order.id,
      },
      data: {
        tracking_id: shipment.trackingId,
        status: shipment.status ?? order.status,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/ventas");
    revalidatePath(`/dashboard/ventas/${order.id}`);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo registrar el despacho",
    };
  }

  redirect(`/dashboard/ventas/${saleId}`);
}

export async function refreshShipmentStatus(
  saleId: string,
  _state: RefreshShipmentState
): Promise<RefreshShipmentState> {
  await requireAdminUser();

  try {
    const order = await prisma.sellerOrder.findUnique({
      where: {
        id: saleId,
      },
      select: {
        id: true,
        tracking_id: true,
        status: true,
      },
    });

    if (!order) {
      throw new Error("Venta no encontrada");
    }

    if (!order.tracking_id) {
      throw new Error("La venta todavia no tiene un trackingId");
    }

    const sellerApiKey = process.env.SELLER_API_KEY;

    if (!sellerApiKey) {
      throw new Error("Falta configurar SELLER_API_KEY");
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
    const payload = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!response.ok) {
      const message =
        typeof payload?.error === "string"
          ? payload.error
          : "No se pudo consultar el envio en Shipping";

      throw new Error(message);
    }

    if (
      !payload ||
      payload.trackingId !== order.tracking_id ||
      typeof payload.status !== "string" ||
      !isShippingStatus(payload.status)
    ) {
      throw new Error("Shipping devolvio datos de envio invalidos");
    }

    if (
      typeof payload.externalSellerOrderId === "string" &&
      payload.externalSellerOrderId !== order.id
    ) {
      throw new Error("Shipping devolvio una orden diferente");
    }

    if (payload.status !== order.status) {
      await prisma.sellerOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: payload.status,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/ventas");
    revalidatePath(`/dashboard/ventas/${order.id}`);

    return {
      status: "success",
      message:
        payload.status === order.status
          ? "El envio ya estaba actualizado."
          : "Estado de envio actualizado.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el envio",
    };
  }
}
