import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-secondary">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Vendé hardware sin complicaciones
        </h2>

        <p className="text-lg max-w-xl mb-6 text-gray-700">
          Publicá tus productos, gestioná tu stock y administrá tus ventas en CompuLibre.
        </p>

        <div className="flex gap-4">
          <Link
            href="/register"
            className="bg-highlight text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
          >
            Empezar a vender
          </Link>

          <Link
            href="/login"
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-8 py-12 bg-secondary">
        <h3 className="text-2xl font-semibold mb-8 text-center text-gray-900">
          Todo lo que necesitás para vender
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h4 className="font-semibold text-lg mb-2 text-gray-900">
              📦 Gestión de productos
            </h4>
            <p className="text-sm text-gray-600">
              Publicá GPUs, CPUs, RAM y más con toda su información técnica.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h4 className="font-semibold text-lg mb-2 text-gray-900">
              📊 Control de stock
            </h4>
            <p className="text-sm text-gray-600">
              Mantené actualizado tu inventario en tiempo real.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h4 className="font-semibold text-lg mb-2 text-gray-900">
              🚚 Gestión de ventas
            </h4>
            <p className="text-sm text-gray-600">
              Seguimiento de órdenes y preparación de envíos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-12 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">
          Empezá hoy mismo
        </h3>

        <p className="mb-6 text-gray-800">
          Unite a CompuLibre y comenzá a vender tus productos.
        </p>

        <Link
          href="/register"
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
        >
          Crear cuenta de vendedor
        </Link>
      </section>
    </>
  );
}