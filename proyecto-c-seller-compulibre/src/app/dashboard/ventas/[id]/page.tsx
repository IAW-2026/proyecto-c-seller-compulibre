import { notFound } from "next/navigation";
import Link from "next/link";

import { TrackShipmentButton } from "@/app/dashboard/ui/track-shipment-button";
import { fetchSaleById } from "@/lib/data";

export default async function SalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await fetchSaleById(id);

  if (!sale) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
            Venta
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            {sale.externalBuyerOrderId}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Detalle de los productos descontados del catalogo.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {sale.trackingId ? (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-gray-500"
            >
              Despacho registrado
            </button>
          ) : (
            <Link
              href={`/dashboard/ventas/${sale.id}/despachar`}
              className="inline-flex items-center justify-center rounded-lg bg-highlight px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85"
            >
              Registrar despacho
            </Link>
          )}
          <TrackShipmentButton trackingId={sale.trackingId} />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Comprador</p>
          <p className="mt-2 truncate text-lg font-semibold text-gray-950">
            {sale.buyer}
          </p>
        </article>

        <article className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Estado</p>
          <p className="mt-2 text-lg font-semibold text-primary">
            {sale.status}
          </p>
        </article>

        <article className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="mt-2 text-lg font-semibold text-primary">
            {sale.total}
          </p>
        </article>
      </section>

      <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">
          Direccion de entrega
        </h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-gray-500">Direccion</dt>
            <dd className="mt-1 font-medium text-gray-950">
              {sale.buyerAddress ?? "Sin direccion"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Codigo postal</dt>
            <dd className="mt-1 font-medium text-gray-950">
              {sale.buyerPostalCode ?? "Sin codigo postal"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="border-b border-primary/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-primary">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="px-5 py-3 font-semibold">Cantidad</th>
                <th className="px-5 py-3 font-semibold">Precio unitario</th>
                <th className="px-5 py-3 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-medium text-gray-950">
                    {item.productName}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {item.unitPrice}
                  </td>
                  <td className="px-5 py-4 font-semibold text-primary">
                    {item.subtotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">
          Referencias externas
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-gray-500">Orden comprador</dt>
            <dd className="font-medium text-gray-950">
              {sale.externalBuyerOrderId}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-gray-500">Transaccion</dt>
            <dd className="font-medium text-gray-950">
              {sale.transactionId ?? "Sin referencia"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-gray-500">Fecha</dt>
            <dd className="font-medium text-gray-950">
              {new Date(sale.createdAt).toLocaleDateString("es-AR")}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
