import Link from "next/link";

import { DeleteProductButton } from "@/app/dashboard/ui/delete-product-button";
import { EditProductButton } from "@/app/dashboard/ui/edit-product-button";
import { Pagination } from "@/app/dashboard/ui/pagination";
import { Search } from "@/app/dashboard/ui/search";
import { requireAdminUser } from "@/lib/auth";
import {
  fetchAdminProductsPage,
  fetchAdminProductsPages,
  fetchAdminSalesPage,
  fetchAdminSalesPages,
} from "@/lib/data";

function getCurrentPage(page?: string) {
  const currentPage = Number(page);

  if (!Number.isInteger(currentPage) || currentPage < 1) {
    return 1;
  }

  return currentPage;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    productPage?: string;
    productQuery?: string;
    salePage?: string;
    saleQuery?: string;
  }>;
}) {
  await requireAdminUser();

  const params = await searchParams;
  const productPage = getCurrentPage(params.productPage);
  const salePage = getCurrentPage(params.salePage);
  const productQuery = params.productQuery ?? "";
  const saleQuery = params.saleQuery ?? "";

  const [products, productPages, sales, salePages] = await Promise.all([
    fetchAdminProductsPage(productQuery, productPage),
    fetchAdminProductsPages(productQuery),
    fetchAdminSalesPage(saleQuery, salePage),
    fetchAdminSalesPages(saleQuery),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Administrador
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          Vista global
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Control general de productos publicados y ventas registradas.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-primary">Productos</h2>
          <Search
            placeholder="Buscar productos..."
            queryParam="productQuery"
            pageParam="productPage"
            inputId="search-admin-products"
          />
        </div>

        <div className="rounded-lg border border-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            {products.length > 0 ? (
              <table className="w-full min-w-220 text-left text-sm">
                <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Producto</th>
                    <th className="px-5 py-3 font-semibold">Seller</th>
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
                        {product.sellerName}
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
                          <DeleteProductButton
                            productId={product.id}
                            redirectPath="/dashboard/admin"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500">
                No hay productos para mostrar.
              </p>
            )}
          </div>
        </div>

        <Pagination
          currentPage={productPage}
          totalPages={productPages}
          query={productQuery}
          basePath="/dashboard/admin"
          pageParam="productPage"
          queryParam="productQuery"
          extraParams={{
            salePage: params.salePage,
            saleQuery,
          }}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-primary">Ventas</h2>
          <Search
            placeholder="Buscar ventas..."
            queryParam="saleQuery"
            pageParam="salePage"
            inputId="search-admin-sales"
          />
        </div>

        <div className="rounded-lg border border-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            {sales.length > 0 ? (
              <table className="w-full min-w-220 text-left text-sm">
                <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Orden</th>
                    <th className="px-5 py-3 font-semibold">Seller</th>
                    <th className="px-5 py-3 font-semibold">Comprador</th>
                    <th className="px-5 py-3 font-semibold">Items</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-5 py-4 font-medium text-gray-950">
                        <Link
                          href={`/dashboard/ventas/${sale.id}`}
                          className="transition hover:text-primary"
                        >
                          {sale.externalBuyerOrderId}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {sale.sellerName}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {sale.buyer}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {sale.itemsCount}
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">
                        {sale.total}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex whitespace-nowrap rounded-md bg-accent/50 px-2 py-1 text-xs font-semibold text-primary">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500">
                No hay ventas para mostrar.
              </p>
            )}
          </div>
        </div>

        <Pagination
          currentPage={salePage}
          totalPages={salePages}
          query={saleQuery}
          basePath="/dashboard/admin"
          pageParam="salePage"
          queryParam="saleQuery"
          extraParams={{
            productPage: params.productPage,
            productQuery,
          }}
        />
      </section>
    </div>
  );
}
