import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await prisma.productImage.findUnique({
    where: { id },
    select: {
      image_data: true,
      mime_type: true,
      original_name: true,
      size: true,
    },
  });

  if (!image?.image_data) {
    return new Response("Imagen no encontrada", { status: 404 });
  }

  return new Response(image.image_data as BodyInit, {
    headers: {
      "Content-Type": image.mime_type ?? "application/octet-stream",
      "Content-Length": image.size?.toString() ?? image.image_data.length.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${image.original_name ?? id}"`,
    },
  });
}
