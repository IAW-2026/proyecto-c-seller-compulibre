import { clerkClient } from "@clerk/nextjs/server";

export async function getBuyerDisplayName(buyerId?: string | null) {
  if (!buyerId) {
    return "Orden externa";
  }

  try {
    const client = await clerkClient();
    const buyer = await client.users.getUser(buyerId);

    return (
      buyer.fullName ||
      buyer.username ||
      buyer.primaryEmailAddress?.emailAddress ||
      buyerId
    );
  } catch {
    return buyerId;
  }
}
