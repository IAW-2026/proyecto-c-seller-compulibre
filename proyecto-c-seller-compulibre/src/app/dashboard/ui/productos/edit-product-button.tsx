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

export function EditProductButtonId({ productId }: { productId: string }) {
  return (
    <Link
      href={`/dashboard/productos/${productId}/edit`}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/85"
    >
      <PencilIcon className="h-4 w-4" aria-hidden="true" />
      Editar producto
    </Link>
  );
}
