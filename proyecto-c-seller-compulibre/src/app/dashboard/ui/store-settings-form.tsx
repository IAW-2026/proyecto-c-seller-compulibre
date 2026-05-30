"use client";

import { useActionState } from "react";

import {
  ARGENTINA_PROVINCES,
  getArgentinaProvince,
} from "@/lib/argentina-provinces";
import {
  updateSellerSettings,
  type UpdateStoreSettingsState,
} from "@/lib/seller-actions";

import { ProductFormSubmitButton } from "./product-form-submit-button";

const initialState: UpdateStoreSettingsState = {
  status: "idle",
  message: "",
};

function parseSellerAddress(sellerAddress?: string | null) {
  if (!sellerAddress) {
    return {
      province: "",
      city: "",
    };
  }

  const [province, ...cityParts] = sellerAddress.split(",");

  return {
    province: getArgentinaProvince(province) ?? "",
    city: cityParts.join(",").trim(),
  };
}

type StoreSettingsFormProps = {
  storeName: string;
  sellerAddress?: string | null;
  postalCode?: string | null;
};

export function StoreSettingsForm({
  storeName,
  sellerAddress,
  postalCode,
}: StoreSettingsFormProps) {
  const address = parseSellerAddress(sellerAddress);
  const [state, formAction] = useActionState(
    updateSellerSettings,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-900">
          Nombre de tienda
        </span>
        <input
          name="storeName"
          type="text"
          required
          minLength={2}
          maxLength={80}
          defaultValue={storeName}
          className="rounded-lg border border-primary/15 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/20"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">
            Provincia
          </span>
          <select
            name="province"
            required
            defaultValue={address.province}
            className="rounded-lg border border-primary/15 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/20"
          >
            <option value="" disabled>
              Seleccionar provincia
            </option>
            {ARGENTINA_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">Ciudad</span>
          <input
            name="city"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={address.city}
            placeholder="Ingresar ciudad"
            className="rounded-lg border border-primary/15 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/20"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-900">
          Codigo postal
        </span>
        <input
          name="postalCode"
          type="text"
          required
          minLength={4}
          maxLength={12}
          defaultValue={postalCode ?? ""}
          className="rounded-lg border border-primary/15 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/20"
        />
      </label>

      {state.message ? (
        <p
          className={[
            "rounded-lg px-4 py-3 text-sm font-medium",
            state.status === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700",
          ].join(" ")}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <ProductFormSubmitButton label="Guardar cambios" />
      </div>
    </form>
  );
}
