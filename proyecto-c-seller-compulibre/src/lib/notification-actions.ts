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