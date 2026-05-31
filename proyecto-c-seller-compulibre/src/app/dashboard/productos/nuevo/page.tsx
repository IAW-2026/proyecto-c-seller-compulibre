import { ProductForm } from "../../ui/productos/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Productos
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          Nuevo producto
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Carga los datos del producto para publicarlo en tu catalogo.
        </p>
      </header>

      <ProductForm />
    </div>
  );
}
