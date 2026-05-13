"use client";

import {
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon },
  { name: "Productos", href: "/dashboard/productos", icon: CubeIcon },
  { name: "Ventas", href: "/dashboard/ventas", icon: ShoppingCartIcon },
];

const settingsLink = {
  name: "Configuracion",
  href: "/dashboard/configuracion",
  icon: Cog6ToothIcon,
};

function getIsActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function DashboardNavLink({
  href,
  name,
  icon: Icon,
}: {
  href: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
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
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          isActive ? "bg-white/15 text-white" : "bg-secondary text-primary",
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
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
