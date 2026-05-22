import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

const PENDING_SHIPMENT = "PENDING_SHIPMENT";

export type ConfirmOrderInput = {
  orderReference: string;
  buyerId: string;
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

export function parseConfirmOrderPayload(payload: unknown): ConfirmOrderInput {
  if (!payload || typeof payload !== "object") {
    throw new OrderConfirmationError("El body debe ser un objeto JSON");
  }

  const body = payload as Record<string, unknown>;

  if (typeof body.orderReference !== "string" || !body.orderReference.trim()) {
    throw new OrderConfirmationError("orderReference es obligatorio");
  }

  if (typeof body.buyerId !== "string" || !body.buyerId.trim()) {
    throw new OrderConfirmationError("buyerId es obligatorio");
  }

  if (typeof body.transactionId !== "string" || !body.transactionId.trim()) {
    throw new OrderConfirmationError("transactionId es obligatorio");
  }

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
    orderReference: body.orderReference.trim(),
    buyerId: body.buyerId.trim(),
    transactionId: body.transactionId.trim(),
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
          stock: { gte: item.quantity },
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
    const sellerOrder = await tx.sellerOrder.create({
      data: {
        external_buyer_order_id: input.orderReference,
        buyer_id: input.buyerId,
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
        status: true,
      },
    });

    return {
      sellerOrderId: sellerOrder.id,
      status: sellerOrder.status,
      message: "Stock descontado exitosamente",
    };
  });
}
