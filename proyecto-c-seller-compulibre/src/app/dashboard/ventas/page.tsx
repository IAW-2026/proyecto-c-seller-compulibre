import Link from "next/link";

import { Pagination } from "@/app/dashboard/ui/pagination";
import { Search } from "@/app/dashboard/ui/search";
import { TrackShipmentButton } from "@/app/dashboard/ui/track-shipment-button";
import { fetchSalesPage, fetchSalesPages } from "@/lib/data";

function getCurrentPage(page?: string) {
  const currentPage = Number(page);

  if (!Number.isInteger(currentPage) || currentPage < 1) {
    return 1;
  }

  return currentPage;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const params = await searchParams;
  const currentPage = getCurrentPage(params.page);
  const query = params.query ?? "";
  const [sales, totalPages] = await Promise.all([
    fetchSalesPage(query, currentPage),
    fetchSalesPages(query),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Ventas
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          Ordenes recientes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Seguimiento rapido de pedidos, pagos y estados de preparacion.
        </p>
      </header>

      <Search placeholder="Buscar ventas..." />

      <section className="w-full overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="w-full max-w-full overflow-x-auto">
          {sales.length > 0 ? (
            <table className="w-full min-w-full text-left text-sm md:min-w-160">
              <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3 font-semibold md:px-5">Orden</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Comprador
                  </th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Items
                  </th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Total
                  </th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">
                    Estado
                  </th>
                  <th className="px-3 py-3 md:px-5">
                    <span className="sr-only">Envio</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-3 py-4 font-medium text-gray-950 md:px-5">
                      <Link
                        href={`/dashboard/ventas/${sale.id}`}
                        className="transition hover:text-primary"
                      >
                        {sale.externalBuyerOrderId}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-4 text-gray-600 md:table-cell">
                      {sale.buyer}
                    </td>
                    <td className="hidden px-5 py-4 text-gray-600 md:table-cell">
                      {sale.itemsCount}
                    </td>
                    <td className="hidden px-5 py-4 font-semibold text-primary md:table-cell">
                      {sale.total}
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="rounded-md bg-accent/50 px-2 py-1 text-xs font-semibold text-primary">
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right md:px-5">
                      <TrackShipmentButton trackingId={sale.trackingId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-sm text-gray-500">
              Todavia no hay ventas registradas.
            </p>
          )}
        </div>
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        basePath="/dashboard/ventas"
      />
    </div>
  );
}
