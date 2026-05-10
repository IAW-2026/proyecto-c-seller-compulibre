import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "./prisma";

const productWithImages = {
  images: true,
} satisfies Prisma.ProductInclude;

const orderWithItems = {
  items: {
    include: {
      product: true,
    },
  },
} satisfies Prisma.SellerOrderInclude;

type ProductWithImages = Prisma.ProductGetPayload<{
  include: typeof productWithImages;
}>;

type OrderWithItems = Prisma.SellerOrderGetPayload<{
  include: typeof orderWithItems;
}>;

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: string;
  brand: string;
  stock: number;
  condition: string;
  status: string;
  imageUrl: string | null;
  images: {
    id: string;
    imageUrl: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type SaleRow = {
  id: string;
  externalBuyerOrderId: string;
  buyer: string;
  status: string;
  itemsCount: number;
  total: string;
};

export type DashboardStats = {
  activeProducts: number;
  lowStockProducts: number;
  salesTotal: string;
  ordersCount: number;
  pendingOrders: number;
};

async function getAuthenticatedSellerId() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return userId;
}

function formatMoney(value: Prisma.Decimal | number | string) {
  const amount = Number(value);

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProductStatus(stock: number) {
  if (stock <= 0) {
    return "Sin stock";
  }

  if (stock <= 5) {
    return "Stock bajo";
  }

  return "Publicado";
}

function serializeProduct(product: ProductWithImages): ProductRow {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: formatMoney(product.price),
    brand: product.brand,
    stock: product.stock,
    condition: product.condition,
    status: getProductStatus(product.stock),
    imageUrl: product.images[0]?.image_url ?? null,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
    })),
    createdAt: product.created_at.toISOString(),
    updatedAt: product.updated_at.toISOString(),
  };
}

function serializeSale(order: OrderWithItems): SaleRow {
  const total = order.items.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: order.id,
    externalBuyerOrderId: order.external_buyer_order_id,
    buyer: "Orden externa",
    status: order.status,
    itemsCount,
    total: formatMoney(total),
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const sellerId = await getAuthenticatedSellerId();

  const [activeProducts, lowStockProducts, orders] = await Promise.all([
    prisma.product.count({
      where: {
        seller_id: sellerId,
        stock: { gt: 0 },
      },
    }),
    prisma.product.count({
      where: {
        seller_id: sellerId,
        stock: { gt: 0, lte: 5 },
      },
    }),
    prisma.sellerOrder.findMany({
      where: { seller_id: sellerId },
      include: orderWithItems,
    }),
  ]);

  const salesTotal = orders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((orderSum, item) => {
        return orderSum + Number(item.price) * item.quantity;
      }, 0)
    );
  }, 0);
  const pendingOrders = orders.filter((order) => {
    return !["entregada", "cancelada", "completed", "cancelled"].includes(
      order.status.toLowerCase()
    );
  }).length;

  return {
    activeProducts,
    lowStockProducts,
    salesTotal: formatMoney(salesTotal),
    ordersCount: orders.length,
    pendingOrders,
  };
}

export async function fetchLatestProducts(limit = 5): Promise<ProductRow[]> {
  const sellerId = await getAuthenticatedSellerId();

  const products = await prisma.product.findMany({
    where: { seller_id: sellerId },
    include: productWithImages,
    orderBy: { created_at: "desc" },
    take: limit,
  });

  return products.map(serializeProduct);
}

export async function fetchProducts(): Promise<ProductRow[]> {
  const sellerId = await getAuthenticatedSellerId();

  const products = await prisma.product.findMany({
    where: { seller_id: sellerId },
    include: productWithImages,
    orderBy: { created_at: "desc" },
  });

  return products.map(serializeProduct);
}

export async function fetchProductById(
  productId: string
): Promise<ProductRow | null> {
  const sellerId = await getAuthenticatedSellerId();

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      seller_id: sellerId,
    },
    include: productWithImages,
  });

  return product ? serializeProduct(product) : null;
}

export async function fetchSales(): Promise<SaleRow[]> {
  const sellerId = await getAuthenticatedSellerId();

  const orders = await prisma.sellerOrder.findMany({
    where: { seller_id: sellerId },
    include: orderWithItems,
    orderBy: { id: "desc" },
  });

  return orders.map(serializeSale);
}
