"use client";

import {
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  KeyIcon,
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

const adminLink = {
  name: "Administrador",
  href: "/dashboard/admin",
  icon: KeyIcon,
};

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

export function DashboardNavLinks({ isAdmin = false }: { isAdmin?: boolean }) {
  const visibleLinks = isAdmin ? [...links, adminLink] : links;

  return (
    <nav className="flex gap-2 md:mt-4 md:flex-col" aria-label="Dashboard">
      {visibleLinks.map((link) => (
        <DashboardNavLink key={link.name} {...link} />
      ))}
    </nav>
  );
}

export function DashboardSettingsLink() {
  const pathname = usePathname();
  const isActive = getIsActive(pathname, settingsLink.href);
  const Icon = settingsLink.icon;

  return (
    <Link
      href={settingsLink.href}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition",
        isActive
          ? "border-primary bg-primary text-white"
          : "border-primary/15 bg-white text-primary hover:bg-accent/35",
      ].join(" ")}
    >
      <span className="sr-only">{settingsLink.name}</span>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
