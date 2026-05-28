"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardUser } from "./auth";
import { prisma } from "./prisma";

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireDashboardUser();

  await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      seller_id: user.id,
    },
  });

  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsAsRead() {
  const user = await requireDashboardUser();

  await prisma.notification.deleteMany({
    where: {
      seller_id: user.id,
    },
  });

  revalidatePath("/dashboard", "layout");
}

export async function createMockNotification() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const user = await requireDashboardUser();
  const timestamp = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await prisma.notification.create({
    data: {
      seller_id: user.id,
      title: "Notificacion de prueba",
      message: `Mock creado a las ${timestamp}`,
      href: "/dashboard/ventas",
    },
  });

  revalidatePath("/dashboard", "layout");
}
