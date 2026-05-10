import type { User } from "@clerk/nextjs/server";

import { prisma } from "./prisma";

function getSellerStoreName(user: User) {
  return (
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Mi tienda"
  );
}

function getSellerEmail(user: User) {
  return user.primaryEmailAddress?.emailAddress || `${user.id}@clerk.local`;
}

export async function ensureSellerProfile(user: User) {
  return prisma.sellerProfile.upsert({
    where: {
      clerk_user_id: user.id,
    },
    create: {
      clerk_user_id: user.id,
      store_name: getSellerStoreName(user),
      contact_email: getSellerEmail(user),
    },
    update: {
      store_name: getSellerStoreName(user),
      contact_email: getSellerEmail(user),
    },
  });
}
