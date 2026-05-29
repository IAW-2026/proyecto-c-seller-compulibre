"use server";

import { revalidatePath } from "next/cache";

import { getArgentinaProvince } from "./argentina-provinces";
import { requireDashboardUser } from "./auth";
import { prisma } from "./prisma";
import { ensureSellerProfile } from "./sellers";

export type UpdateStoreSettingsState = {
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

function readProvince(formData: FormData) {
  const value = formData.get("province");
  const province = typeof value === "string" ? getArgentinaProvince(value) : null;

  if (!province) {
    throw new Error("La provincia seleccionada no es valida");
  }

  return province;
}

function readCity(formData: FormData) {
  const value = formData.get("city");

  if (typeof value !== "string") {
    throw new Error("La ciudad es obligatoria");
  }

  const city = value.trim();

  if (city.length < 2) {
    throw new Error("La ciudad debe tener al menos 2 caracteres");
  }

  if (city.length > 80) {
    throw new Error("La ciudad no puede superar los 80 caracteres");
  }

  return city;
}

function readPostalCode(formData: FormData) {
  const value = formData.get("postalCode");

  if (typeof value !== "string") {
    throw new Error("El codigo postal es obligatorio");
  }

  const postalCode = value.trim();

  if (postalCode.length < 4) {
    throw new Error("El codigo postal debe tener al menos 4 caracteres");
  }

  if (postalCode.length > 12) {
    throw new Error("El codigo postal no puede superar los 12 caracteres");
  }

  return postalCode;
}

export async function updateSellerSettings(
  _state: UpdateStoreSettingsState,
  formData: FormData
): Promise<UpdateStoreSettingsState> {
  try {
    const user = await requireDashboardUser();
    await ensureSellerProfile(user);
    const province = readProvince(formData);
    const city = readCity(formData);

    await prisma.sellerProfile.update({
      where: {
        clerk_user_id: user.id,
      },
      data: {
        store_name: readStoreName(formData),
        seller_address: `${province}, ${city}`,
        postal_code: readPostalCode(formData),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/configuracion");

    return {
      status: "success",
      message: "Datos de tienda guardados correctamente.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los datos de tienda.",
    };
  }
}
