import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { isAdminUser, requireDashboardUser } from "@/lib/auth";
import { fetchUnreadNotifications } from "@/lib/notifications";
import { ensureSellerProfile } from "@/lib/sellers";

import { NotificationBell } from "@/app/dashboard/ui/notification-bell";
import {
  DashboardNavLinks,
  DashboardSettingsLink,
} from "@/app/ui/dashboard/nav-links";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireDashboardUser();
  const seller = await ensureSellerProfile(user);
  const displayName = seller.store_name;
  const email = seller.contact_email;
  const isAdmin = isAdminUser(user);
  const notifications = await fetchUnreadNotifications();

  return (
    <div className="min-h-screen bg-secondary text-gray-950 md:flex">
      <aside className="flex border-b border-primary/10 bg-white md:sticky md:top-0 md:h-screen md:w-72 md:flex-col md:border-b-0 md:border-r">
        <div className="flex w-full flex-col gap-4 p-4 md:p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              CL
            </div>
            <div>
              <p className="text-base font-semibold text-primary">
                CompuLibre
              </p>
              <p className="text-xs font-medium text-gray-500">
                Panel vendedor
              </p>
            </div>
          </Link>

          <DashboardNavLinks isAdmin={isAdmin} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-end gap-3 border-b border-primary/10 bg-white px-4 py-3 md:px-8">
          <NotificationBell notifications={notifications} />
          <DashboardSettingsLink />
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold text-gray-900">
              {displayName || "Vendedor"}
            </p>
            {email ? (
              <p className="truncate text-xs text-gray-500">{email}</p>
            ) : null}
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
