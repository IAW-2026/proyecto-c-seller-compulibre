import { Prisma, ProductCategory, ProductCondition } from "@prisma/client";

import { prisma } from "./prisma";

const DEFAULT_PRODUCTS_LIMIT = 12;
const MAX_PRODUCTS_LIMIT = 50;

type CatalogProduct = {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  category: string;
  price: string;
  brand: string;
  stock: number;
  condition: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type CatalogProductsInput = {
  query?: string | null;
  category?: string | null;
  condition?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  sort?: string | null;
  ascendingPrice?: string | null;
  descendingPrice?: string | null;
  page?: string | null;
  limit?: string | null;
};

function serializeCatalogProduct(product: {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  price: { toString(): string };
  brand: string;
  stock: number;
  condition: string;
  seller: { store_name: string };
  images: { image_url: string }[];
  created_at: Date;
  updated_at: Date;
}): CatalogProduct {
  return {
    id: product.id,
    sellerId: product.seller_id,
    sellerName: product.seller.store_name,
    name: product.name,
    category: product.category,
    price: product.price.toString(),
    brand: product.brand,
    stock: product.stock,
    condition: product.condition,
    image: product.images[0]?.image_url ?? null,
    createdAt: product.created_at.toISOString(),
    updatedAt: product.updated_at.toISOString(),
  };
}

function parsePositiveInteger(value: string | null | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function parseLimit(value: string | null | undefined) {
  const limit = parsePositiveInteger(value, DEFAULT_PRODUCTS_LIMIT);

  return Math.min(limit, MAX_PRODUCTS_LIMIT);
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

function isTruthyParam(value: string | null | undefined) {
  return value === "true" || value === "1";
}

function getCatalogProductsOrderBy(input: CatalogProductsInput) {
  if (
    input.sort === "ascendingPrice" ||
    isTruthyParam(input.ascendingPrice)
  ) {
    return { price: "asc" } satisfies Prisma.ProductOrderByWithRelationInput;
  }

  if (
    input.sort === "descendingPrice" ||
    isTruthyParam(input.descendingPrice)
  ) {
    return { price: "desc" } satisfies Prisma.ProductOrderByWithRelationInput;
  }

  return { created_at: "desc" } satisfies Prisma.ProductOrderByWithRelationInput;
}

function getCatalogProductsWhere(
  query: string,
  category: ProductCategory | null,
  condition: ProductCondition | null,
  minPrice: number | null,
  maxPrice: number | null
) {
  const where: Prisma.ProductWhereInput = {};

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
  ];
  const categoryQuery = query.toUpperCase();

  if (Object.values(ProductCategory).includes(categoryQuery as ProductCategory)) {
    filters.push({ category: { equals: categoryQuery as ProductCategory } });
  }

  where.OR = filters;

  return where;
}

export async function getCatalogProducts(input: CatalogProductsInput = {}) {
  const query = input.query?.trim() ?? "";
  const category = parseCategory(input.category);
  const condition = parseCondition(input.condition);
  const minPrice = parsePrice(input.minPrice);
  const maxPrice = parsePrice(input.maxPrice);
  const page = parsePositiveInteger(input.page, 1);
  const limit = parseLimit(input.limit);
  const offset = (page - 1) * limit;
  const where = getCatalogProductsWhere(
    query,
    category,
    condition,
    minPrice,
    maxPrice
  );
  const orderBy = getCatalogProductsOrderBy(input);

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { store_name: true },
        },
        images: {
          select: { image_url: true },
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
    products: products.map(serializeCatalogProduct),
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
    },
  };
}

export async function getAllCatalogProducts() {
  const products = await prisma.product.findMany({
    include: {
      seller: {
        select: { store_name: true },
      },
      images: {
        select: { image_url: true },
        take: 1,
      },
    },
    orderBy: { created_at: "desc" },
  });

  return products.map(serializeCatalogProduct);
}

export async function getCatalogProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        select: { store_name: true },
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

  const { image: _image, ...catalogProduct } = serializeCatalogProduct(product);

  return {
    ...catalogProduct,
    description: product.description,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
    })),
  };
}
