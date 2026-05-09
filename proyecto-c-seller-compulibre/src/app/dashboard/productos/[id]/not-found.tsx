import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-lg border border-primary/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
        Producto no encontrado
      </p>
      <h1 className="text-2xl font-bold text-primary">
        No pudimos encontrar este producto
      </h1>
      <p className="text-sm leading-6 text-gray-600">
        Puede que haya sido eliminado o que no pertenezca a tu cuenta de
        vendedor.
      </p>
      <Link
        href="/dashboard/productos"
        className="w-fit rounded-lg bg-highlight px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/90"
      >
        Volver a productos
      </Link>
    </div>
  );
}
