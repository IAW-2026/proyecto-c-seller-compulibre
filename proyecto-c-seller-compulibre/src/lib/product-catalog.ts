import { prisma } from "./prisma";

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

export async function getCatalogProducts() {
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

  const catalogProduct = serializeCatalogProduct(product);

  return {
    ...catalogProduct,
    description: product.description,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
    })),
  };
}
