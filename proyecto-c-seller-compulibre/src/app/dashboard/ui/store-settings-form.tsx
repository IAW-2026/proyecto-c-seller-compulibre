"use client";

import { useActionState } from "react";

import {
  updateSellerStoreName,
  type UpdateStoreNameState,
} from "@/lib/seller-actions";

const initialState: UpdateStoreNameState = {
  status: "idle",
  message: "",
};

export function StoreSettingsForm({ storeName }: { storeName: string }) {
  const [state, formAction, pending] = useActionState(
    updateSellerStoreName,
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
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-highlight px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
