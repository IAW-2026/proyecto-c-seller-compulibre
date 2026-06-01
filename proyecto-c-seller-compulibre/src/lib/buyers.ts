import { clerkClient, type User } from "@clerk/nextjs/server";

function getClerkBuyerDisplayName(buyer: User) {
  return (
    buyer.fullName ||
    buyer.username ||
    buyer.primaryEmailAddress?.emailAddress ||
    buyer.id
  );
}

export async function getBuyerDisplayName(buyerId?: string | null) {
  if (!buyerId) {
    return "Orden externa";
  }

  try {
    const client = await clerkClient();
    const buyer = await client.users.getUser(buyerId);

    return getClerkBuyerDisplayName(buyer);
  } catch {
    return buyerId;
  }
}

export async function getBuyerDisplayNames(buyerIds: (string | null)[]) {
  const uniqueBuyerIds = Array.from(
    new Set(buyerIds.filter((buyerId): buyerId is string => Boolean(buyerId)))
  );
  const displayNames = new Map(
    uniqueBuyerIds.map((buyerId) => [buyerId, buyerId])
  );

  if (uniqueBuyerIds.length === 0) {
    return displayNames;
  }

  try {
    const client = await clerkClient();
    const buyers = await client.users.getUserList({
      userId: uniqueBuyerIds,
      limit: uniqueBuyerIds.length,
    });

    buyers.data.forEach((buyer) => {
      displayNames.set(buyer.id, getClerkBuyerDisplayName(buyer));
    });
  } catch {
    return displayNames;
  }

  return displayNames;
}
