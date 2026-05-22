import { TrashIcon } from "@heroicons/react/24/outline";

import { deleteProductFromForm } from "@/lib/product-actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const deleteProductWithId = deleteProductFromForm.bind(null, productId);

  return (
    <form action={deleteProductWithId}>
      <button
        type="submit"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
      >
        <span className="sr-only">Eliminar producto</span>
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
