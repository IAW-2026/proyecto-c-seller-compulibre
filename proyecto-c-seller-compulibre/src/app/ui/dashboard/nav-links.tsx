"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Inicio", href: "/dashboard", symbol: "I" },
  { name: "Productos", href: "/dashboard/productos", symbol: "P" },
  { name: "Ventas", href: "/dashboard/ventas", symbol: "V" },
];

export function DashboardNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 md:mt-4 md:flex-col" aria-label="Dashboard">
      {links.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={[
              "flex min-h-11 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition md:flex-none",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 hover:bg-accent/40 hover:text-primary",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                isActive ? "bg-white/15 text-white" : "bg-secondary text-primary",
              ].join(" ")}
              aria-hidden="true"
            >
              {link.symbol}
            </span>
            <span className="truncate">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
