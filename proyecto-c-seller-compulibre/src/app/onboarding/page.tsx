import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { StoreSettingsForm } from "@/app/dashboard/ui/configuracion/store-settings-form";
import { requireDashboardUser } from "@/lib/auth";
import { completeSellerOnboarding } from "@/lib/seller-actions";
import { ensureSellerProfile } from "@/lib/sellers";

export default async function OnboardingPage() {
  const user = await requireDashboardUser();
  const seller = await ensureSellerProfile(user);

  if (seller.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-secondary text-gray-950">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-primary/10 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            CL
          </div>
          <div>
            <p className="text-base font-semibold text-primary">CompuLibre</p>
            <p className="text-xs font-medium text-gray-500">
              Panel vendedor
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-gray-900">
              {seller.store_name || "Vendedor"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {seller.contact_email}
            </p>
          </div>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-primary/15 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-accent/35"
            >
              Cerrar sesion
            </button>
          </SignOutButton>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <header className="text-center">
            <p className="text-sm font-semibold uppercase text-highlight">
              Bienvenido a CompuLibre
            </p>
            <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
              Configura tu tienda
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Antes de comenzar, completa los datos de tu comercio y la
              direccion desde donde vas a despachar tus pedidos.
            </p>
          </header>

          <section className="w-full min-w-0 rounded-lg border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
            <StoreSettingsForm
              storeName={seller.store_name}
              sellerAddress={seller.seller_address}
              postalCode={seller.postal_code}
              action={completeSellerOnboarding}
              submitLabel="Guardar y continuar"
            />
          </section>
        </div>
      </main>
    </div>
  );
}
