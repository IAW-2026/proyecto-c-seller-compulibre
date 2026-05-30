import { notFound } from "next/navigation";

import { DeleteProductButton } from "@/app/dashboard/ui/productos/delete-product-button";
import { EditProductButtonId } from "@/app/dashboard/ui/productos/edit-product-button";
import { fetchProductById } from "@/lib/data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Producto
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          {product.name}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Ultima actualizacion: {new Date(product.updatedAt).toLocaleDateString("es-AR")}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">
            Datos principales
          </h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Marca</dt>
              <dd className="font-medium text-gray-950">{product.brand}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Categoria</dt>
              <dd className="font-medium text-gray-950">{product.category}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Condicion</dt>
              <dd className="font-medium text-gray-950">{product.condition}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Estado</dt>
              <dd className="font-medium text-gray-950">{product.status}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Venta</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Precio</dt>
              <dd className="font-semibold text-primary">{product.price}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Stock</dt>
              <dd className="font-medium text-gray-950">{product.stock}</dd>
            </div>
          </dl>
        </article>
      </section>

      {product.images.length > 0 ? (
        <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Imagenes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {product.images.map((image) => (
              <img
                key={image.id}
                src={image.imageUrl}
                alt={product.name}
                className="aspect-video w-full rounded-lg border border-primary/10 object-cover"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Descripcion</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {product.description || "Este producto todavia no tiene descripcion."}
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DeleteProductButton
          productId={product.id}
          productName={product.name}
          showLabel
        />
        <EditProductButtonId 
          productId={product.id} 
        />
      </div>
    </div>
  );
}
