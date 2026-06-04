"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { deleteProductFromForm } from "@/lib/product-actions";

export function DeleteProductButton({
  productId,
  productName,
  redirectPath = "/dashboard/productos",
  showLabel = false,
}: {
  productId: string;
  productName: string;
  redirectPath?: string;
  showLabel?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteProductWithId = deleteProductFromForm.bind(
    null,
    productId,
    redirectPath
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
          showLabel
            ? "bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700"
            : "h-9 w-9 border border-red-200 text-red-600 hover:bg-red-50",
        ].join(" ")}
      >
        <span className={showLabel ? "" : "sr-only"}>Eliminar producto</span>
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsOpen(false);
            }
          }}
        >
          <section
            className="w-full max-w-md rounded-lg border border-primary/10 bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-product-title-${productId}`}
          >
            <h2
              id={`delete-product-title-${productId}`}
              className="text-lg font-semibold text-primary"
            >
              Eliminar producto
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              ¿Estas seguro de que queres eliminar &quot;{productName}&quot;?
              Esta accion no se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-secondary"
              >
                Cancelar
              </button>
              <form action={deleteProductWithId}>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  Eliminar
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
