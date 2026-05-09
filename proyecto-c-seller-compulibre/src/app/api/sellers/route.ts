import { prisma } from '@/lib/prisma'

export async function GET() {
  const sellers = await prisma.sellerProfile.findMany()
  return Response.json(sellers)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const seller = await prisma.sellerProfile.create({
      data: {
        clerk_user_id: body.clerkUserId,
        store_name: body.storeName,
        contact_email: body.contactEmail
      }
    })

    return Response.json(seller, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Error creating seller' }, { status: 500 })
  }
}
