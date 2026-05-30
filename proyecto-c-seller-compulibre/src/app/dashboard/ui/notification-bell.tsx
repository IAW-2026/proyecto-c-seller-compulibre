"use client";

import {
  BellIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notification-actions";
import type { NotificationRow } from "@/lib/notifications";

export function NotificationBell({
  notifications,
}: {
  notifications: NotificationRow[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.length;
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 text-primary transition hover:bg-accent/35"
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-highlight px-1 text-[11px] font-bold leading-none text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed left-4 right-4 top-16 z-30 overflow-hidden rounded-lg border border-primary/10 bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80">
          <div className="border-b border-primary/10 px-4 py-3">
            <p className="text-sm font-semibold text-primary">
              Notificaciones
            </p>
          </div>

          {notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 border-b border-primary/10 px-4 py-3 last:border-b-0"
                >
                  <Link
                    href={notification.href ?? "/dashboard/ventas"}
                    className="min-w-0 flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {notification.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                      {notification.message}
                    </p>
                  </Link>
                  <form action={markNotificationAsRead.bind(null, notification.id)}>
                    <button
                      type="submit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 text-primary transition hover:bg-accent/35"
                      aria-label="Marcar notificacion como leida"
                    >
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              No hay nuevas notificaciones
            </p>
          )}

          {notifications.length > 0 ? (
            <form action={markAllNotificationsAsRead}>
              <button
                type="submit"
                className="w-full border-t border-primary/10 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-secondary/70"
              >
                Marcar todo como leido
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
