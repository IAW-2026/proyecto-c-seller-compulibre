import { requireDashboardUser } from "@/lib/auth";
import { ensureSellerProfile } from "@/lib/sellers";
import { StoreSettingsForm } from "@/app/dashboard/ui/store-settings-form";

export default async function SettingsPage() {
  const user = await requireDashboardUser();
  const seller = await ensureSellerProfile(user);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-highlight">
          Configuracion
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          Datos de tienda
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Cambia el nombre del comercio y la direccion de despacho.
        </p>
      </header>

      <section className="w-full min-w-0 rounded-lg border border-primary/10 bg-white p-6 shadow-sm">
        <StoreSettingsForm
          storeName={seller.store_name}
          sellerAddress={seller.seller_address}
          postalCode={seller.postal_code}
        />
      </section>
    </div>
  );
}
