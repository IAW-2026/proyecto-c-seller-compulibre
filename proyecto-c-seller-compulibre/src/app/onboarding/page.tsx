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
    <main className="min-h-screen bg-secondary px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase text-highlight">
            Bienvenido a CompuLibre
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            Configura tu tienda
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Antes de comenzar, completa los datos de tu comercio y la direccion
            desde donde vas a despachar tus pedidos.
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
  );
}
