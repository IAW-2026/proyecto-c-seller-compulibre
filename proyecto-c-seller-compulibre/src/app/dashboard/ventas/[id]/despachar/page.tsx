import { notFound } from "next/navigation";
import Link from "next/link";

import { DispatchForm } from "@/app/dashboard/ui/ventas/dispatch-form";
import { fetchSaleById } from "@/lib/data";

export default async function DispatchSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await fetchSaleById(id);

  if (!sale) {
    notFound();
  }

  if (sale.trackingId) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="rounded-lg border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Error
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            El producto ya se despacho
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Esta venta ya tiene un tracking generado, por eso no se puede
            registrar un nuevo despacho.
          </p>
          <div className="mt-6">
            <Link
              href={`/dashboard/ventas/${sale.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-highlight px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85"
            >
              Volver a la venta
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Despacho
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          Registrar despacho
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          {sale.orderName}
        </p>
      </header>

      <section className="rounded-lg border border-primary/10 bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 rounded-lg bg-secondary/50 p-4 text-sm md:grid-cols-2">
          <div>
            <p className="font-medium text-gray-500">Destino</p>
            <p className="mt-1 font-semibold text-gray-950">
              {sale.buyerAddress ?? "Sin direccion"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Origen</p>
            <p className="mt-1 font-semibold text-gray-950">
              {sale.originAddress ?? "Sin direccion configurada"}
            </p>
          </div>
        </div>

        <DispatchForm saleId={sale.id} />
      </section>
    </div>
  );
}
