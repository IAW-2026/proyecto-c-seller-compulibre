import { fetchDashboardStats, fetchLatestProducts } from "@/lib/data";

export default async function Page() {
  const [dashboardStats, products] = await Promise.all([
    fetchDashboardStats(),
    fetchLatestProducts(5),
  ]);
  const stats = [
    {
      label: "Productos activos",
      value: dashboardStats.activeProducts.toString(),
      detail: `${dashboardStats.lowStockProducts} con stock bajo`,
    },
    {
      label: "Ventas registradas",
      value: dashboardStats.salesTotal,
      detail: `${dashboardStats.ordersCount} ordenes`,
    },
    {
      label: "Pedidos pendientes",
      value: dashboardStats.pendingOrders.toString(),
      detail: "Ordenes por revisar",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Inicio
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          Dashboard
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-3 text-2xl font-bold text-gray-950">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="border-b border-primary/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-primary">
            Productos destacados
          </h2>
        </div>
        <div className="overflow-x-auto">
          {products.length > 0 ? (
            <table className="w-full min-w-full md:min-w-155 text-left text-sm">
              <thead className="bg-secondary/70 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Producto</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4 font-medium text-gray-950">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.stock}
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">
                      {product.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-sm text-gray-500">
              Todavia no hay productos cargados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
