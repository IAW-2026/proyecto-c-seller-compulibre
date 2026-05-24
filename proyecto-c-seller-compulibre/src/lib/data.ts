import { auth } from "@clerk/nextjs/server";
import { Prisma, ProductCategory } from "@prisma/client";
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

const PRODUCTS_PER_PAGE = 9;
const SALES_PER_PAGE = 9;

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
  priceValue: string;
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
  transactionId: string | null;
  buyer: string;
  status: string;
  itemsCount: number;
  total: string;
  createdAt: string;
};

export type SaleDetail = SaleRow & {
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
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
    priceValue: product.price.toString(),
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
    transactionId: order.transaction_id,
    buyer: order.buyer_id ?? "Orden externa",
    status: order.status,
    itemsCount,
    total: formatMoney(total),
    createdAt: order.created_at.toISOString(),
  };
}

function serializeSaleDetail(order: OrderWithItems): SaleDetail {
  return {
    ...serializeSale(order),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: formatMoney(item.price),
      subtotal: formatMoney(Number(item.price) * item.quantity),
    })),
  };
}

function getProductsWhere(sellerId: string, query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { seller_id: sellerId } satisfies Prisma.ProductWhereInput;
  }

  const productFilters: Prisma.ProductWhereInput[] = [
    { name: { contains: trimmedQuery, mode: "insensitive" } },
    { brand: { contains: trimmedQuery, mode: "insensitive" } },
  ];
  const categoryQuery = trimmedQuery.toUpperCase();

  if (Object.values(ProductCategory).includes(categoryQuery as ProductCategory)) {
    productFilters.push({ category: { equals: categoryQuery as ProductCategory } });
  }

  return {
    seller_id: sellerId,
    OR: productFilters,
  } satisfies Prisma.ProductWhereInput;
}

function getSalesWhere(sellerId: string, query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { seller_id: sellerId } satisfies Prisma.SellerOrderWhereInput;
  }

  return {
    seller_id: sellerId,
    OR: [
      {
        external_buyer_order_id: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      { buyer_id: { contains: trimmedQuery, mode: "insensitive" } },
      { transaction_id: { contains: trimmedQuery, mode: "insensitive" } },
      { status: { contains: trimmedQuery, mode: "insensitive" } },
      {
        items: {
          some: {
            product: {
              name: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ],
  } satisfies Prisma.SellerOrderWhereInput;
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

export async function fetchProductsPage(
  query: string,
  page: number
): Promise<ProductRow[]> {
  const sellerId = await getAuthenticatedSellerId();
  const currentPage = Math.max(page, 1);
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const where = getProductsWhere(sellerId, query);

  const products = await prisma.product.findMany({
    where,
    include: productWithImages,
    orderBy: { created_at: "desc" },
    skip: offset,
    take: PRODUCTS_PER_PAGE,
  });

  return products.map(serializeProduct);
}

export async function fetchProductsPages(query: string) {
  const sellerId = await getAuthenticatedSellerId();
  const where = getProductsWhere(sellerId, query);
  const count = await prisma.product.count({
    where,
  });

  return Math.ceil(count / PRODUCTS_PER_PAGE);
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
    orderBy: { created_at: "desc" },
  });

  return orders.map(serializeSale);
}

export async function fetchSalesPage(
  query: string,
  page: number
): Promise<SaleRow[]> {
  const sellerId = await getAuthenticatedSellerId();
  const currentPage = Math.max(page, 1);
  const offset = (currentPage - 1) * SALES_PER_PAGE;
  const where = getSalesWhere(sellerId, query);

  const orders = await prisma.sellerOrder.findMany({
    where,
    include: orderWithItems,
    orderBy: { created_at: "desc" },
    skip: offset,
    take: SALES_PER_PAGE,
  });

  return orders.map(serializeSale);
}

export async function fetchSalesPages(query: string) {
  const sellerId = await getAuthenticatedSellerId();
  const where = getSalesWhere(sellerId, query);
  const count = await prisma.sellerOrder.count({ where });

  return Math.ceil(count / SALES_PER_PAGE);
}

export async function fetchSaleById(saleId: string): Promise<SaleDetail | null> {
  const sellerId = await getAuthenticatedSellerId();

  const order = await prisma.sellerOrder.findFirst({
    where: {
      id: saleId,
      seller_id: sellerId,
    },
    include: orderWithItems,
  });

  return order ? serializeSaleDetail(order) : null;
}
