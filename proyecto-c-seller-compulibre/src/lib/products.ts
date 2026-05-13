'use server'

import { Prisma } from '@prisma/client'
import type { ProductCategory, ProductCondition } from '@prisma/client'

import { prisma } from './prisma'

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true }
}>

export type Product = {
  id: string
  sellerId: string
  name: string
  description: string | null
  category: ProductCategory
  price: string
  brand: string
  stock: number
  condition: ProductCondition
  images: {
    id: string
    imageUrl: string
  }[]
  createdAt: string
  updatedAt: string
}

export type CreateProductInput = {
  sellerId: string
  name: string
  description?: string | null
  category: ProductCategory
  price: number | string
  brand: string
  stock: number
  condition: ProductCondition
  imageUrls?: string[]
}

export type UpdateProductInput = Partial<
  Omit<CreateProductInput, 'sellerId' | 'imageUrls'>
> & {
  imageUrls?: string[]
}

const productWithImages = {
  images: true,
} satisfies Prisma.ProductInclude

function toProductPrice(price: number | string) {
  return new Prisma.Decimal(price)
}

function cleanImageUrls(imageUrls: string[] = []) {
  return imageUrls
    .map((imageUrl) => imageUrl.trim())
    .filter((imageUrl) => imageUrl.length > 0)
}

function serializeProduct(product: ProductWithImages): Product {
  return {
    id: product.id,
    sellerId: product.seller_id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price.toString(),
    brand: product.brand,
    stock: product.stock,
    condition: product.condition,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
    })),
    createdAt: product.created_at.toISOString(),
    updatedAt: product.updated_at.toISOString(),
  }
}

export async function getProductsBySeller(
  sellerId: string
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { seller_id: sellerId },
    include: productWithImages,
    orderBy: { created_at: 'desc' },
  })

  return products.map(serializeProduct)
}

export async function getProductById(
  productId: string,
  sellerId: string
): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      seller_id: sellerId,
    },
    include: productWithImages,
  })

  return product ? serializeProduct(product) : null
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const imageUrls = cleanImageUrls(input.imageUrls)

  const product = await prisma.product.create({
    data: {
      seller_id: input.sellerId,
      name: input.name,
      description: input.description,
      category: input.category,
      price: toProductPrice(input.price),
      brand: input.brand,
      stock: input.stock,
      condition: input.condition,
      images: imageUrls.length
        ? {
            create: imageUrls.map((imageUrl) => ({
              image_url: imageUrl,
            })),
          }
        : undefined,
    },
    include: productWithImages,
  })

  return serializeProduct(product)
}

export async function updateProduct(
  productId: string,
  sellerId: string,
  input: UpdateProductInput
): Promise<Product> {
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      seller_id: sellerId,
    },
    select: { id: true },
  })

  if (!existingProduct) {
    throw new Error('Producto no encontrado para este vendedor')
  }

  const imageUrls =
    input.imageUrls === undefined ? undefined : cleanImageUrls(input.imageUrls)

  const product = await prisma.$transaction(async (tx) => {
    if (imageUrls !== undefined) {
      await tx.productImage.deleteMany({
        where: { product_id: productId },
      })
    }

    return tx.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        price:
          input.price === undefined ? undefined : toProductPrice(input.price),
        brand: input.brand,
        stock: input.stock,
        condition: input.condition,
        images:
          imageUrls === undefined || imageUrls.length === 0
            ? undefined
            : {
                create: imageUrls.map((imageUrl) => ({
                  image_url: imageUrl,
                })),
              },
      },
      include: productWithImages,
    })
  })

  return serializeProduct(product)
}

export async function deleteProduct(
  productId: string,
  sellerId: string
): Promise<Product> {
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      seller_id: sellerId,
    },
    select: { id: true },
  })

  if (!existingProduct) {
    throw new Error('Producto no encontrado para este vendedor')
  }

  const product = await prisma.product.delete({
    where: { id: productId },
    include: productWithImages,
  })

  return serializeProduct(product)
}
