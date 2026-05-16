import { PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function EditProductButton({ productId }: { productId: string }) {
  return (
    <Link
      href={`/dashboard/productos/${productId}/edit`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 text-primary transition hover:bg-accent/35"
    >
      <span className="sr-only">Editar producto</span>
      <PencilIcon className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
