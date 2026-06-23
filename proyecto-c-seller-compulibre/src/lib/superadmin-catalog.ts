import { Prisma, ProductCategory, ProductCondition } from "@prisma/client";

import { getArgentinaProvince } from "./argentina-provinces";
import { getBuyerDisplayName, getBuyerDisplayNames } from "./buyers";
import { prisma } from "./prisma";

const DEFAULT_ADMIN_LIMIT = 12;
const MAX_ADMIN_LIMIT = 50;

export type SuperadminListInput = {
  query?: string | null;
  sellerId?: string | null;
  category?: string | null;
  condition?: string | null;
  status?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  sort?: string | null;
  ascendingPrice?: string | null;
  descendingPrice?: string | null;
  page?: string | null;
  limit?: string | null;
};

type SuperadminProductUpdateInput = {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  price?: unknown;
  brand?: unknown;
  stock?: unknown;
  condition?: unknown;
  imageUrls?: unknown;
};

type SuperadminSellerUpdateInput = {
  storeName?: unknown;
  contactEmail?: unknown;
  sellerAddress?: unknown;
  postalCode?: unknown;
  province?: unknown;
  city?: unknown;
};

function parsePositiveInteger(value: string | null | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function parseLimit(value: string | null | undefined) {
  const limit = parsePositiveInteger(value, DEFAULT_ADMIN_LIMIT);

  return Math.min(limit, MAX_ADMIN_LIMIT);
}

function parsePrice(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

function parseCategory(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const category = value.trim().toUpperCase();

  if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
    return null;
  }

  return category as ProductCategory;
}

function parseCondition(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const condition = value.trim().toUpperCase();

  if (!Object.values(ProductCondition).includes(condition as ProductCondition)) {
    return null;
  }

  return condition as ProductCondition;
}

function readOptionalString(
  value: unknown,
  field: string,
  { min = 0, max = 200 } = {}
) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`El campo ${field} debe ser texto`);
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < min) {
    throw new Error(`El campo ${field} debe tener al menos ${min} caracteres`);
  }

  if (trimmedValue.length > max) {
    throw new Error(`El campo ${field} no puede superar ${max} caracteres`);
  }

  return trimmedValue;
}

function readOptionalRequiredString(
  value: unknown,
  field: string,
  options?: { min?: number; max?: number }
) {
  const stringValue = readOptionalString(value, field, options);

  if (stringValue === null) {
    throw new Error(`El campo ${field} no puede ser nulo`);
  }

  return stringValue;
}

function readOptionalNumber(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`El campo ${field} debe ser un numero valido`);
  }

  return numberValue;
}

function readOptionalInteger(value: unknown, field: string) {
  const numberValue = readOptionalNumber(value, field);

  if (numberValue === undefined) {
    return undefined;
  }

  if (!Number.isInteger(numberValue)) {
    throw new Error(`El campo ${field} debe ser un numero entero`);
  }

  return numberValue;
}

function readOptionalCategory(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("La categoria debe ser texto");
  }

  const category = parseCategory(value);

  if (!category) {
    throw new Error("La categoria seleccionada no es valida");
  }

  return category;
}

function readOptionalCondition(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("La condicion debe ser texto");
  }

  const condition = parseCondition(value);

  if (!condition) {
    throw new Error("La condicion seleccionada no es valida");
  }

  return condition;
}

function readOptionalImageUrls(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error("El campo imageUrls debe ser una lista");
  }

  return value.map((imageUrl) => {
    if (typeof imageUrl !== "string") {
      throw new Error("Cada imagen debe ser una URL de texto");
    }

    return imageUrl.trim();
  }).filter(Boolean);
}

function assertUpdateHasFields(data: object) {
  if (Object.keys(data).length === 0) {
    throw new Error("No hay campos para actualizar");
  }
}

function isTruthyParam(value: string | null | undefined) {
  return value === "true" || value === "1";
}

function getPagination(page: number, limit: number, totalItems: number) {
  return {
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
  };
}

function getProductsOrderBy(input: SuperadminListInput) {
  if (input.sort === "ascendingPrice" || isTruthyParam(input.ascendingPrice)) {
    return { price: "asc" } satisfies Prisma.ProductOrderByWithRelationInput;
  }

  if (input.sort === "descendingPrice" || isTruthyParam(input.descendingPrice)) {
    return { price: "desc" } satisfies Prisma.ProductOrderByWithRelationInput;
  }

  return { created_at: "desc" } satisfies Prisma.ProductOrderByWithRelationInput;
}

function getSellersWhere(query: string) {
  if (!query) {
    return {};
  }

  return {
    OR: [
      { clerk_user_id: { contains: query, mode: "insensitive" } },
      { store_name: { contains: query, mode: "insensitive" } },
      { contact_email: { contains: query, mode: "insensitive" } },
      { seller_address: { contains: query, mode: "insensitive" } },
      { postal_code: { contains: query, mode: "insensitive" } },
    ],
  } satisfies Prisma.SellerProfileWhereInput;
}

function getProductsWhere(input: SuperadminListInput) {
  const query = input.query?.trim() ?? "";
  const category = parseCategory(input.category);
  const condition = parseCondition(input.condition);
  const minPrice = parsePrice(input.minPrice);
  const maxPrice = parsePrice(input.maxPrice);
  const where: Prisma.ProductWhereInput = {};

  if (input.sellerId?.trim()) {
    where.seller_id = input.sellerId.trim();
  }

  if (category) {
    where.category = category;
  }

  if (condition) {
    where.condition = condition;
  }

  if (minPrice !== null || maxPrice !== null) {
    where.price = {
      ...(minPrice !== null ? { gte: minPrice } : {}),
      ...(maxPrice !== null ? { lte: maxPrice } : {}),
    };
  }

  if (!query) {
    return where;
  }

  const filters: Prisma.ProductWhereInput[] = [
    { name: { contains: query, mode: "insensitive" } },
    { brand: { contains: query, mode: "insensitive" } },
    {
      seller: {
        store_name: { contains: query, mode: "insensitive" },
      },
    },
    {
      seller: {
        contact_email: { contains: query, mode: "insensitive" },
      },
    },
  ];
  const categoryQuery = query.toUpperCase();

  if (Object.values(ProductCategory).includes(categoryQuery as ProductCategory)) {
    filters.push({ category: categoryQuery as ProductCategory });
  }

  where.OR = filters;

  return where;
}

function getOrdersWhere(input: SuperadminListInput) {
  const query = input.query?.trim() ?? "";
  const where: Prisma.SellerOrderWhereInput = {};

  if (input.sellerId?.trim()) {
    where.seller_id = input.sellerId.trim();
  }

  if (input.status?.trim()) {
    where.status = input.status.trim().toUpperCase();
  }

  if (!query) {
    return where;
  }

  where.OR = [
    { id: { contains: query, mode: "insensitive" } },
    { external_buyer_order_id: { contains: query, mode: "insensitive" } },
    { buyer_id: { contains: query, mode: "insensitive" } },
    { buyer_address: { contains: query, mode: "insensitive" } },
    { buyer_postal_code: { contains: query, mode: "insensitive" } },
    { tracking_id: { contains: query, mode: "insensitive" } },
    { transaction_id: { contains: query, mode: "insensitive" } },
    { status: { contains: query, mode: "insensitive" } },
    {
      seller: {
        store_name: { contains: query, mode: "insensitive" },
      },
    },
    {
      items: {
        some: {
          product: {
            name: { contains: query, mode: "insensitive" },
          },
        },
      },
    },
  ];

  return where;
}

function serializeSeller(seller: {
  clerk_user_id: string;
  store_name: string;
  contact_email: string;
  seller_address: string | null;
  postal_code: string | null;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
  _count?: { products: number; orders: number };
}) {
  return {
    id: seller.clerk_user_id,
    storeName: seller.store_name,
    contactEmail: seller.contact_email,
    sellerAddress: seller.seller_address,
    postalCode: seller.postal_code,
    onboardingCompleted: seller.onboarding_completed,
    productsCount: seller._count?.products,
    ordersCount: seller._count?.orders,
    createdAt: seller.created_at.toISOString(),
    updatedAt: seller.updated_at.toISOString(),
  };
}

function serializeProduct(product: {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  category: string;
  price: { toString(): string };
  brand: string;
  stock: number;
  condition: string;
  created_at: Date;
  updated_at: Date;
  seller: {
    clerk_user_id: string;
    store_name: string;
    contact_email: string;
  };
  images: { id: string; image_url: string }[];
}) {
  return {
    id: product.id,
    sellerId: product.seller_id,
    sellerName: product.seller.store_name,
    sellerEmail: product.seller.contact_email,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price.toString(),
    brand: product.brand,
    stock: product.stock,
    condition: product.condition,
    image: product.images[0]?.image_url ?? null,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
    })),
    createdAt: product.created_at.toISOString(),
    updatedAt: product.updated_at.toISOString(),
  };
}

function serializeOrder(
  order: {
    id: string;
    order_number: number;
    external_buyer_order_id: string;
    buyer_id: string | null;
    buyer_address: string | null;
    buyer_postal_code: string | null;
    tracking_id: string | null;
    transaction_id: string | null;
    seller_id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    seller: {
      clerk_user_id: string;
      store_name: string;
      contact_email: string;
      seller_address: string | null;
      postal_code: string | null;
    };
    items: {
      id: string;
      quantity: number;
      price: { toString(): string };
      product: {
        id: string;
        name: string;
        brand: string;
        category: string;
        images: { image_url: string }[];
      };
    }[];
  },
  buyerName: string
) {
  const total = order.items.reduce((accumulator, item) => {
    return accumulator + Number(item.price.toString()) * item.quantity;
  }, 0);

  return {
    id: order.id,
    orderNumber: order.order_number,
    orderName: `Orden #${order.order_number}`,
    externalBuyerOrderId: order.external_buyer_order_id,
    buyerId: order.buyer_id,
    buyerName,
    buyerAddress: order.buyer_address,
    buyerPostalCode: order.buyer_postal_code,
    sellerId: order.seller_id,
    sellerName: order.seller.store_name,
    sellerEmail: order.seller.contact_email,
    originAddress: order.seller.seller_address,
    originPostalCode: order.seller.postal_code,
    trackingId: order.tracking_id,
    transactionId: order.transaction_id,
    status: order.status,
    itemsCount: order.items.reduce(
      (accumulator, item) => accumulator + item.quantity,
      0
    ),
    total: total.toFixed(2),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand,
      category: item.product.category,
      quantity: item.quantity,
      price: item.price.toString(),
      image: item.product.images[0]?.image_url ?? null,
    })),
    createdAt: order.created_at.toISOString(),
    updatedAt: order.updated_at.toISOString(),
  };
}

export async function getSuperadminSellers(input: SuperadminListInput = {}) {
  const query = input.query?.trim() ?? "";
  const page = parsePositiveInteger(input.page, 1);
  const limit = parseLimit(input.limit);
  const offset = (page - 1) * limit;
  const where = getSellersWhere(query);

  const [sellers, totalSellers] = await Promise.all([
    prisma.sellerProfile.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.sellerProfile.count({ where }),
  ]);

  return {
    sellers: sellers.map(serializeSeller),
    pagination: {
      ...getPagination(page, limit, totalSellers),
      totalSellers,
    },
  };
}

export async function getSuperadminSellerById(sellerId: string) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { clerk_user_id: sellerId },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
  });

  if (!seller) {
    return null;
  }

  return serializeSeller(seller);
}

export async function updateSuperadminSeller(
  sellerId: string,
  input: SuperadminSellerUpdateInput
) {
  const sellerAddress = readOptionalString(input.sellerAddress, "sellerAddress", {
    min: 2,
    max: 160,
  });
  const province = readOptionalString(input.province, "province", {
    min: 2,
    max: 80,
  });
  const city = readOptionalString(input.city, "city", {
    min: 2,
    max: 80,
  });
  const normalizedProvince =
    province === undefined || province === null
      ? undefined
      : getArgentinaProvince(province);

  if (province !== undefined && !normalizedProvince) {
    throw new Error("La provincia seleccionada no es valida");
  }

  if (
    (province !== undefined && city === undefined) ||
    (province === undefined && city !== undefined)
  ) {
    throw new Error("Provincia y ciudad deben enviarse juntas");
  }

  const data: Prisma.SellerProfileUpdateInput = {
    store_name: readOptionalRequiredString(input.storeName, "storeName", {
      min: 2,
      max: 80,
    }),
    contact_email: readOptionalRequiredString(input.contactEmail, "contactEmail", {
      min: 5,
      max: 120,
    }),
    seller_address:
      normalizedProvince && city
        ? `${normalizedProvince}, ${city}`
        : sellerAddress,
    postal_code: readOptionalString(input.postalCode, "postalCode", {
      min: 4,
      max: 12,
    }),
  };

  Object.keys(data).forEach((key) => {
    const typedKey = key as keyof Prisma.SellerProfileUpdateInput;

    if (data[typedKey] === undefined) {
      delete data[typedKey];
    }
  });
  assertUpdateHasFields(data);

  const seller = await prisma.sellerProfile.update({
    where: { clerk_user_id: sellerId },
    data,
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
  });

  return serializeSeller(seller);
}

export async function getSuperadminProducts(input: SuperadminListInput = {}) {
  const page = parsePositiveInteger(input.page, 1);
  const limit = parseLimit(input.limit);
  const offset = (page - 1) * limit;
  const where = getProductsWhere(input);
  const orderBy = getProductsOrderBy(input);

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            clerk_user_id: true,
            store_name: true,
            contact_email: true,
          },
        },
        images: {
          select: {
            id: true,
            image_url: true,
          },
          take: 1,
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProduct),
    pagination: {
      ...getPagination(page, limit, totalProducts),
      totalProducts,
    },
  };
}

export async function getSuperadminProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        select: {
          clerk_user_id: true,
          store_name: true,
          contact_email: true,
        },
      },
      images: {
        select: {
          id: true,
          image_url: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return serializeProduct(product);
}

export async function updateSuperadminProduct(
  productId: string,
  input: SuperadminProductUpdateInput
) {
  const imageUrls = readOptionalImageUrls(input.imageUrls);
  const data: Prisma.ProductUpdateInput = {
    name: readOptionalRequiredString(input.name, "name", {
      min: 2,
      max: 120,
    }),
    description: readOptionalString(input.description, "description", {
      max: 800,
    }),
    category: readOptionalCategory(input.category),
    price:
      input.price === undefined
        ? undefined
        : new Prisma.Decimal(readOptionalNumber(input.price, "price") ?? 0),
    brand: readOptionalRequiredString(input.brand, "brand", {
      min: 2,
      max: 80,
    }),
    stock: readOptionalInteger(input.stock, "stock"),
    condition: readOptionalCondition(input.condition),
  };

  Object.keys(data).forEach((key) => {
    const typedKey = key as keyof Prisma.ProductUpdateInput;

    if (data[typedKey] === undefined) {
      delete data[typedKey];
    }
  });

  if (imageUrls !== undefined) {
    data.images =
      imageUrls.length === 0
        ? undefined
        : {
            create: imageUrls.map((imageUrl) => ({ image_url: imageUrl })),
          };
  }

  assertUpdateHasFields({
    ...data,
    ...(imageUrls !== undefined ? { imageUrls } : {}),
  });

  const product = await prisma.$transaction(async (tx) => {
    if (imageUrls !== undefined) {
      await tx.productImage.deleteMany({
        where: { product_id: productId },
      });
    }

    return tx.product.update({
      where: { id: productId },
      data,
      include: {
        seller: {
          select: {
            clerk_user_id: true,
            store_name: true,
            contact_email: true,
          },
        },
        images: {
          select: {
            id: true,
            image_url: true,
          },
        },
      },
    });
  });

  return serializeProduct(product);
}

export async function deleteSuperadminProduct(productId: string) {
  const product = await prisma.product.delete({
    where: { id: productId },
    include: {
      seller: {
        select: {
          clerk_user_id: true,
          store_name: true,
          contact_email: true,
        },
      },
      images: {
        select: {
          id: true,
          image_url: true,
        },
      },
    },
  });

  return serializeProduct(product);
}

export async function getSuperadminOrders(input: SuperadminListInput = {}) {
  const page = parsePositiveInteger(input.page, 1);
  const limit = parseLimit(input.limit);
  const offset = (page - 1) * limit;
  const where = getOrdersWhere(input);

  const [orders, totalOrders] = await Promise.all([
    prisma.sellerOrder.findMany({
      where,
      include: {
        seller: {
          select: {
            clerk_user_id: true,
            store_name: true,
            contact_email: true,
            seller_address: true,
            postal_code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                category: true,
                images: {
                  select: { image_url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.sellerOrder.count({ where }),
  ]);
  const buyerNames = await getBuyerDisplayNames(
    orders.map((order) => order.buyer_id)
  );

  return {
    orders: orders.map((order) =>
      serializeOrder(
        order,
        order.buyer_id ? buyerNames.get(order.buyer_id) ?? order.buyer_id : "Orden externa"
      )
    ),
    pagination: {
      ...getPagination(page, limit, totalOrders),
      totalOrders,
    },
  };
}

export async function getSuperadminOrderById(orderId: string) {
  const order = await prisma.sellerOrder.findUnique({
    where: { id: orderId },
    include: {
      seller: {
        select: {
          clerk_user_id: true,
          store_name: true,
          contact_email: true,
          seller_address: true,
          postal_code: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              images: {
                select: { image_url: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return serializeOrder(order, await getBuyerDisplayName(order.buyer_id));
}
