import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { DeleteProductButton } from "@/app/dashboard/ui/productos/delete-product-button";
import { EditProductButton } from "@/app/dashboard/ui/productos/edit-product-button";
import { Pagination } from "@/app/dashboard/ui/pagination";
import { Search } from "@/app/dashboard/ui/search";
import { fetchProductsPage, fetchProductsPages } from "@/lib/data";
import { getCurrentPage } from "@/lib/pagination";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const params = await searchParams;
  const currentPage = getCurrentPage(params.page);
  const query = params.query ?? "";
  const [products, totalPages] = await Promise.all([
    fetchProductsPage(query, currentPage),
    fetchProductsPages(query),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
            Productos
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            Catalogo de venta
          </h1>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Search placeholder="Buscar productos..." />
        <Link
          href="/dashboard/productos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-highlight px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85"
        >
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
          <span>Nuevo producto</span>
        </Link>
      </div>

      <section className="w-full overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="w-full max-w-full overflow-x-auto">
          {products.length > 0 ? (
            <table className="w-full min-w-full text-left text-sm md:min-w-180">
              <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3 font-semibold md:px-5">
                    Producto
                  </th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Marca
                  </th>
                  <th className="px-3 py-3 text-center font-semibold md:px-5 md:text-left">
                    Stock
                  </th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Precio
                  </th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Estado
                  </th>
                  <th className="w-24 px-3 py-3 md:w-28 md:px-5">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-4 font-medium text-gray-950 md:px-5">
                      <Link
                        href={`/dashboard/productos/${product.id}`}
                        className="transition hover:text-primary"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-4 text-gray-600 md:table-cell">
                      {product.brand}
                    </td>
                    <td className="px-3 py-4 text-center text-gray-600 md:px-5 md:text-left">
                      {product.stock}
                    </td>
                    <td className="hidden px-5 py-4 font-semibold text-primary md:table-cell">
                      {product.price}
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="inline-flex whitespace-nowrap rounded-md bg-accent/50 px-2 py-1 text-xs font-semibold text-primary">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 md:px-5">
                      <div className="flex justify-end gap-2">
                        <EditProductButton productId={product.id} />
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-sm text-gray-500">
              Todavia no hay productos para mostrar.
            </p>
          )}
        </div>
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
      />
    </div>
  );
}
