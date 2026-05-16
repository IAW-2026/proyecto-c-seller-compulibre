import { ProductCategory, ProductCondition } from "@prisma/client";
import Link from "next/link";

import { createProductFromForm } from "@/lib/product-actions";

import { ImageUploadField } from "./image-upload-field";

const categories = Object.values(ProductCategory);
const conditions = Object.values(ProductCondition);

const categoryLabels: Record<ProductCategory, string> = {
  CPU: "CPU",
  GPU: "GPU",
  RAM: "RAM",
  STORAGE: "Almacenamiento",
  MOTHERBOARD: "Motherboard",
  PSU: "Fuente",
  CASE: "Gabinete",
  COOLER: "Cooler",
  MONITOR: "Monitor",
  PERIPHERAL: "Periferico",
  OTHER: "Otro",
};

const conditionLabels: Record<ProductCondition, string> = {
  NEW: "Nuevo",
  USED: "Usado",
  REFURBISHED: "Reacondicionado",
};

export type ProductFormValues = {
  name: string;
  brand: string;
  category: string;
  condition: string;
  description: string | null;
  priceValue: string;
  stock: number;
  images?: {
    id: string;
    imageUrl: string;
  }[];
};

type ProductFormProps = {
  action?: (formData: FormData) => Promise<void>;
  product?: ProductFormValues;
  submitLabel?: string;
  imageHelpText?: string;
};

export function ProductForm({
  action = createProductFromForm,
  product,
  submitLabel = "Guardar producto",
  imageHelpText,
}: ProductFormProps) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">
          Informacion principal
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Nombre
            <input
              required
              name="name"
              type="text"
              defaultValue={product?.name}
              className="rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Marca
            <input
              required
              name="brand"
              type="text"
              defaultValue={product?.brand}
              className="rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Categoria
            <select
              required
              name="category"
              defaultValue={product?.category ?? ""}
              className="rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="" disabled>
                Seleccionar categoria
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Condicion
            <select
              required
              name="condition"
              defaultValue={product?.condition ?? ""}
              className="rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="" disabled>
                Seleccionar condicion
              </option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {conditionLabels[condition]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-gray-700">
          Descripcion
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            className="resize-y rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </section>

      <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Venta y stock</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Precio
            <input
              required
              name="price"
              type="text"
              inputMode="decimal"
              defaultValue={product?.priceValue}
              className="rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Stock
            <input
              required
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock}
              className="rounded-lg border border-primary/20 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <ImageUploadField />
        {product?.images?.length ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              Imagenes actuales
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {product.images.map((image) => (
                <img
                  key={image.id}
                  src={image.imageUrl}
                  alt={product.name}
                  className="aspect-video w-full rounded-lg border border-primary/10 object-cover"
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {imageHelpText ??
                "Si elegis nuevas imagenes, van a reemplazar las actuales."}
            </p>
          </div>
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/productos"
          className="rounded-lg border border-primary/20 bg-white px-4 py-2 text-center text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-highlight px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
