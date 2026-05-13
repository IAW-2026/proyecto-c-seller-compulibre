import { fetchSales } from "@/lib/data";

export default async function SalesPage() {
  const sales = await fetchSales();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
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

      <section className="rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {sales.length > 0 ? (
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Orden</th>
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
                      {sale.externalBuyerOrderId}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{sale.buyer}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {sale.itemsCount}
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">
                      {sale.total}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-accent/50 px-2 py-1 text-xs font-semibold text-primary">
                        {sale.status}
                      </span>
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
    </div>
  );
}
