import Link from "next/link";

import { DeleteProductButton } from "@/app/dashboard/ui/delete-product-button";
import { EditProductButton } from "@/app/dashboard/ui/edit-product-button";
import { Pagination } from "@/app/dashboard/ui/pagination";
import { fetchProductsPage, fetchProductsPages } from "@/lib/data";

function getCurrentPage(page?: string) {
  const currentPage = Number(page);

  if (!Number.isInteger(currentPage) || currentPage < 1) {
    return 1;
  }

  return currentPage;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = getCurrentPage(params.page);
  const [products, totalPages] = await Promise.all([
    fetchProductsPage(currentPage),
    fetchProductsPages(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
            Productos
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            Catalogo de venta
          </h1>
        </div>
        <Link
          href="/dashboard/productos/nuevo"
          className="rounded-lg bg-highlight px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85"
        >
          Nuevo producto
        </Link>
      </header>

      <section className="rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {products.length > 0 ? (
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Producto</th>
                  <th className="px-5 py-3 font-semibold">Marca</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="w-28 px-5 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4 font-medium text-gray-950">
                      <Link
                        href={`/dashboard/productos/${product.id}`}
                        className="transition hover:text-primary"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.brand}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.stock}
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">
                      {product.price}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex whitespace-nowrap rounded-md bg-accent/50 px-2 py-1 text-xs font-semibold text-primary">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <EditProductButton productId={product.id} />
                        <DeleteProductButton productId={product.id} />
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

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
