import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const SHIPPING_APP_URL = "https://proyecto-c-shipping-compulibre.vercel.app";

export function TrackShipmentButton({ trackingId }: { trackingId: string }) {
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
