"use client";

import { useActionState } from "react";

import {
  registerShipmentFromForm,
  type RegisterShipmentState,
} from "@/lib/shipment-actions";
import { SHIPPING_COURIERS } from "@/lib/shipping";

const initialState: RegisterShipmentState = {
  status: "idle",
  message: "",
};

export function DispatchForm({ saleId }: { saleId: string }) {
  const registerShipment = registerShipmentFromForm.bind(null, saleId);
  const [state, formAction, pending] = useActionState(
    registerShipment,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-900">Courier</span>
        <select
          name="courier"
          required
          defaultValue=""
          className="rounded-lg border border-primary/15 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/20"
        >
          <option value="" disabled>
            Seleccionar courier
          </option>
          {SHIPPING_COURIERS.map((courier) => (
            <option key={courier} value={courier}>
              {courier}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-900">
          Codigo de seguimiento
        </span>
        <input
          name="externalTrackingId"
          type="text"
          required
          maxLength={80}
          placeholder="ANDREANI-001"
          className="rounded-lg border border-primary/15 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/20"
        />
      </label>

      {state.message ? (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
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
          {pending ? "Confirmando..." : "Confirmar despacho"}
        </button>
      </div>
    </form>
  );
}
