import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

const PENDING_SHIPMENT = "PENDING_SHIPMENT";

export type ConfirmOrderInput = {
  orderReference: string;
  buyerId: string;
  buyerAddress: string;
  buyerPostalCode: string;
  transactionId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

export type ConfirmOrderResult = {
  sellerOrderId: string;
  status: string;
  message: string;
};

export class OrderConfirmationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderConfirmationError";
    this.status = status;
  }
}

function normalizeItems(items: ConfirmOrderInput["items"]) {
  const quantitiesByProductId = new Map<string, number>();

  items.forEach((item) => {
    quantitiesByProductId.set(
      item.productId,
      (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity
    );
  });

  return Array.from(quantitiesByProductId.entries()).map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    })
  );
}

function readRequiredString(
  body: Record<string, unknown>,
  field: string,
  label = field
) {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new OrderConfirmationError(`${label} es obligatorio`);
  }

  return value.trim();
}

function readRequiredStringOrNumber(value: unknown, label: string) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }

  throw new OrderConfirmationError(`${label} es obligatorio`);
}

export function parseConfirmOrderPayload(payload: unknown): ConfirmOrderInput {
  if (!payload || typeof payload !== "object") {
    throw new OrderConfirmationError("El body debe ser un objeto JSON");
  }

  const body = payload as Record<string, unknown>;
  const buyerPostalCode = body.buyerPostalCode ?? body.buyerCodigoPostal;

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new OrderConfirmationError("items debe tener al menos un producto");
  }

  const items = body.items.map((item) => {
    if (!item || typeof item !== "object") {
      throw new OrderConfirmationError("Cada item debe ser un objeto");
    }

    const orderItem = item as Record<string, unknown>;

    if (typeof orderItem.productId !== "string" || !orderItem.productId) {
      throw new OrderConfirmationError("Cada item debe tener productId");
    }

    if (
      typeof orderItem.quantity !== "number" ||
      !Number.isInteger(orderItem.quantity) ||
      orderItem.quantity <= 0
    ) {
      throw new OrderConfirmationError(
        "Cada item debe tener quantity entero positivo"
      );
    }

    return {
      productId: orderItem.productId,
      quantity: orderItem.quantity,
    };
  });

  return {
    orderReference: readRequiredString(body, "orderReference"),
    buyerId: readRequiredString(body, "buyerId"),
    buyerAddress: readRequiredString(body, "buyerAddress"),
    buyerPostalCode: readRequiredStringOrNumber(
      buyerPostalCode,
      "buyerPostalCode"
    ),
    transactionId: readRequiredString(body, "transactionId"),
    items: normalizeItems(items),
  };
}

export async function confirmCatalogOrder(
  input: ConfirmOrderInput
): Promise<ConfirmOrderResult> {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.sellerOrder.findUnique({
      where: { transaction_id: input.transactionId },
      select: { id: true, status: true },
    });

    if (existingOrder) {
      return {
        sellerOrderId: existingOrder.id,
        status: existingOrder.status,
        message: "Orden ya confirmada previamente",
      };
    }

    const products = await tx.product.findMany({
      where: {
        id: {
          in: input.items.map((item) => item.productId),
        },
      },
      select: {
        id: true,
        seller_id: true,
        stock: true,
        price: true,
      },
    });

    if (products.length !== input.items.length) {
      throw new OrderConfirmationError("Uno o mas productos no existen", 404);
    }

    const sellerIds = new Set(products.map((product) => product.seller_id));

    if (sellerIds.size !== 1) {
      throw new OrderConfirmationError(
        "Los items pertenecen a distintos vendedores",
        400
      );
    }

    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const item of input.items) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new OrderConfirmationError("Producto no encontrado", 404);
      }

      if (product.stock < item.quantity) {
        throw new OrderConfirmationError(
          `Stock insuficiente para el producto ${item.productId}`,
          409
        );
      }

      const updatedProduct = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (updatedProduct.count !== 1) {
        throw new OrderConfirmationError(
          `Stock insuficiente para el producto ${item.productId}`,
          409
        );
      }
    }

    const sellerId = products[0].seller_id;
    const seller = await tx.sellerProfile.update({
      where: {
        clerk_user_id: sellerId,
      },
      data: {
        next_order_number: {
          increment: 1,
        },
      },
      select: {
        next_order_number: true,
      },
    });
    const sellerOrder = await tx.sellerOrder.create({
      data: {
        order_number: seller.next_order_number - 1,
        external_buyer_order_id: input.orderReference,
        buyer_id: input.buyerId,
        buyer_address: input.buyerAddress,
        buyer_postal_code: input.buyerPostalCode,
        transaction_id: input.transactionId,
        seller_id: sellerId,
        status: PENDING_SHIPMENT,
        items: {
          create: input.items.map((item) => {
            const product = productsById.get(item.productId);

            if (!product) {
              throw new OrderConfirmationError("Producto no encontrado", 404);
            }

            return {
              product_id: item.productId,
              quantity: item.quantity,
              price: new Prisma.Decimal(product.price),
            };
          }),
        },
      },
      select: {
        id: true,
        order_number: true,
        status: true,
      },
    });

    await tx.notification.create({
      data: {
        seller_id: sellerId,
        title: "Nueva venta",
        message: `Recibiste una nueva venta: Orden #${sellerOrder.order_number}`,
        href: `/dashboard/ventas/${sellerOrder.id}`,
      },
    });

    return {
      sellerOrderId: sellerOrder.id,
      status: sellerOrder.status,
      message: "Orden confirmada exitosamente",
    };
  });
}
