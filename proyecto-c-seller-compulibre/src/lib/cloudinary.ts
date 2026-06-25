import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function assertCloudinaryConfig() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Faltan variables de entorno de Cloudinary");
  }
}

function uploadBuffer(buffer: Buffer, folder: string) {
  assertCloudinaryConfig();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary no devolvio resultado de subida"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadProductImagesToCloudinary(
  files: File[],
  sellerId: string
) {
  const folder = `compulibre/products/${sellerId}`;

  return Promise.all(
    files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const result = await uploadBuffer(Buffer.from(bytes), folder);

      return result.secure_url;
    })
  );
}
