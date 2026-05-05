// src/app/api/products/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany()
  return Response.json(products)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        price: body.price,
        brand: body.brand,
        stock_available: body.stock,
        condition: body.condition,
        seller_id: body.sellerId,
      },
    })

    return Response.json(product, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}