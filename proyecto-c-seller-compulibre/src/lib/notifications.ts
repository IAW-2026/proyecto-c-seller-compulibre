import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "./prisma";

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  createdAt: string;
};

async function getAuthenticatedSellerId() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return userId;
}

export async function fetchUnreadNotifications(): Promise<NotificationRow[]> {
  const sellerId = await getAuthenticatedSellerId();

  const notifications = await prisma.notification.findMany({
    where: {
      seller_id: sellerId,
    },
    orderBy: {
      created_at: "desc",
    },
    take: 20,
  });

  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    createdAt: notification.created_at.toISOString(),
  }));
}
