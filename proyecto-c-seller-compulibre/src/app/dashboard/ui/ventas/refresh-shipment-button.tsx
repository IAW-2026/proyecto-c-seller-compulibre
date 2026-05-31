"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useActionState } from "react";

import {
  refreshShipmentStatus,
  type RefreshShipmentState,
} from "@/lib/shipment-actions";

const initialState: RefreshShipmentState = {
  status: "idle",
  message: "",
};

export function RefreshShipmentButton({
  saleId,
  trackingId,
}: {
  saleId: string;
  trackingId?: string | null;
}) {
  const refreshShipment = refreshShipmentStatus.bind(null, saleId);
  const [state, formAction, pending] = useActionState(
    refreshShipment,
    initialState
  );
  const disabled = !trackingId || pending;

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction}>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-accent/35 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${pending ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span>{pending ? "Actualizando..." : "Actualizar envio"}</span>
        </button>
      </form>
      {state.message ? (
        <p
          className={`text-xs ${
            state.status === "error" ? "text-red-600" : "text-primary"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
