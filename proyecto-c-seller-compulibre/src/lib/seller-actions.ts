"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardUser } from "./auth";
import { prisma } from "./prisma";
import { ensureSellerProfile } from "./sellers";

export type UpdateStoreNameState = {
  status: "idle" | "success" | "error";
  message: string;
};

function readStoreName(formData: FormData) {
  const value = formData.get("storeName");

  if (typeof value !== "string") {
    throw new Error("El nombre de tienda es obligatorio");
  }

  const storeName = value.trim();

  if (storeName.length < 2) {
    throw new Error("El nombre de tienda debe tener al menos 2 caracteres");
  }

  if (storeName.length > 80) {
    throw new Error("El nombre de tienda no puede superar los 80 caracteres");
  }

  return storeName;
}

export async function updateSellerStoreName(
  _state: UpdateStoreNameState,
  formData: FormData
): Promise<UpdateStoreNameState> {
  try {
    const user = await requireDashboardUser();
    await ensureSellerProfile(user);

    await prisma.sellerProfile.update({
      where: {
        clerk_user_id: user.id,
      },
      data: {
        store_name: readStoreName(formData),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/configuracion");

    return {
      status: "success",
      message: "Nombre de tienda guardado correctamente.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo guardar el nombre de tienda.",
    };
  }
}
