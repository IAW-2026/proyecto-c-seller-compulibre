import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { SHIPPING_APP_URL } from "@/lib/shipping";

export function TrackShipmentButton({
  trackingId,
}: {
  trackingId?: string | null;
}) {
  if (!trackingId) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-primary/10 px-3 py-2 text-sm font-semibold text-gray-400"
      >
        <span>Seguir envio</span>
        <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <Link
      href={`${SHIPPING_APP_URL}/track/${trackingId}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-accent/35"
    >
      <span>Seguir envio</span>
      <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
