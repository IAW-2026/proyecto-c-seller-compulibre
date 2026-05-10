"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";

import { ProductCategory, ProductCondition } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireDashboardUser } from "./auth";
import { createProduct } from "./products";
import { ensureSellerProfile } from "./sellers";

function readRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`El campo ${field} es obligatorio`);
  }

  return value.trim();
}

function readOptionalString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function readRequiredNumber(formData: FormData, field: string) {
  const value = Number(readRequiredString(formData, field));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`El campo ${field} debe ser un numero valido`);
  }

  return value;
}

function readRequiredInteger(formData: FormData, field: string) {
  const value = readRequiredNumber(formData, field);

  if (!Number.isInteger(value)) {
    throw new Error(`El campo ${field} debe ser un numero entero`);
  }

  return value;
}

function readCategory(formData: FormData) {
  const value = readRequiredString(formData, "category");

  if (!Object.values(ProductCategory).includes(value as ProductCategory)) {
    throw new Error("La categoria seleccionada no es valida");
  }

  return value as ProductCategory;
}

function readCondition(formData: FormData) {
  const value = readRequiredString(formData, "condition");

  if (!Object.values(ProductCondition).includes(value as ProductCondition)) {
    throw new Error("La condicion seleccionada no es valida");
  }

  return value as ProductCondition;
}

function getImageExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
    return extension;
  }

  if (file.type === "image/jpeg") {
    return ".jpg";
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "image/gif") {
    return ".gif";
  }

  throw new Error("Solo se pueden cargar imagenes JPG, PNG, WebP o GIF");
}

async function prepareProductImages(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return [];
  }

  return Promise.all(
    files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("Solo se pueden cargar archivos de imagen");
      }

      getImageExtension(file);
      const imageId = randomUUID();
      const bytes = await file.arrayBuffer();

      return {
        id: imageId,
        imageUrl: `/api/product-images/${imageId}`,
        mimeType: file.type,
        originalName: file.name,
        size: file.size,
        data: Buffer.from(bytes),
      };
    })
  );
}

export async function createProductFromForm(formData: FormData) {
  const user = await requireDashboardUser();
  const seller = await ensureSellerProfile(user);
  const imageUploads = await prepareProductImages(formData);

  const product = await createProduct({
    sellerId: seller.clerk_user_id,
    name: readRequiredString(formData, "name"),
    description: readOptionalString(formData, "description"),
    category: readCategory(formData),
    price: readRequiredNumber(formData, "price"),
    brand: readRequiredString(formData, "brand"),
    stock: readRequiredInteger(formData, "stock"),
    condition: readCondition(formData),
    imageUploads,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/productos");
  redirect(`/dashboard/productos/${product.id}`);
}
