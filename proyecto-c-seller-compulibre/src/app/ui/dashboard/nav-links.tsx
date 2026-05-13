"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Inicio", href: "/dashboard", symbol: "I" },
  { name: "Productos", href: "/dashboard/productos", symbol: "P" },
  { name: "Ventas", href: "/dashboard/ventas", symbol: "V" },
];

const settingsLink = {
  name: "Configuracion",
  href: "/dashboard/configuracion",
  symbol: "C",
};

function getIsActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function DashboardNavLink({
  href,
  name,
  symbol,
}: {
  href: string;
  name: string;
  symbol: string;
}) {
  const pathname = usePathname();
  const isActive = getIsActive(pathname, href);

  return (
    <Link
      href={href}
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
        {symbol}
      </span>
      <span className="truncate">{name}</span>
    </Link>
  );
}

export function DashboardNavLinks() {
  return (
    <nav className="flex gap-2 md:mt-4 md:flex-col" aria-label="Dashboard">
      {links.map((link) => (
        <DashboardNavLink key={link.name} {...link} />
      ))}
    </nav>
  );
}

export function DashboardSettingsLink() {
  return <DashboardNavLink {...settingsLink} />;
}
