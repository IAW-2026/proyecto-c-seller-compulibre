import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";

import { redirectSignedInUserToDashboard } from "@/lib/auth";

export default async function Page() {
  await redirectSignedInUserToDashboard();

  return (
    <main className="flex min-h-screen flex-col bg-secondary">

      {/* Hero */}
      
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex flex-col items-center max-w-3xl w-full">
          <Image
            src="/logo5.png"
            alt="CompuLibre Logo"
            width={350}
            height={350}
            className="w-64 h-64 md:w-70 md:h-70 lg:w-80 lg:h-80"
            priority
          />

          <h2 className="text-5xl font-bold tracking-tight text-primary">
            Vendé hardware y periféricos en CompuLibre
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-700">
            Gestioná tu catálogo, controlá tu stock y seguí tus ventas
            desde un único dashboard moderno y simple.
          </p>

          <Show when="signed-out">
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row w-full">
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard"><button className="w-full rounded-2xl border border-primary bg-highlight px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:scale-[1.05] sm:w-auto">Empezar a vender</button></SignUpButton>

              <SignInButton mode="modal" forceRedirectUrl="/dashboard"><button className="w-full rounded-2xl border border-primary bg-highlight px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:scale-[1.05] sm:w-auto">Ya tengo cuenta</button></SignInButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="mt-10 flex items-center justify-center">
              <UserButton />
            </div>
          </Show>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-6 px-6 pb-16 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-xl font-semibold text-primary">
            Gestión de stock
          </h3>

          <p className="mt-3 text-gray-600">
            Administrá productos, precios y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-xl font-semibold text-primary">
            Seguimiento de ventas
          </h3>

          <p className="mt-3 text-gray-600">
            Visualizá órdenes, estados de envío y pagos aprobados.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-xl font-semibold text-primary">
            Dashboard moderno
          </h3>

          <p className="mt-3 text-gray-600">
            Accedé a estadísticas y controlá tu negocio desde cualquier lugar.
          </p>
        </div>
      </section>
    </main>
  );
}
