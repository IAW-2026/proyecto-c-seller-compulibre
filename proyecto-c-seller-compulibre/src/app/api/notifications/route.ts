import { fetchUnreadNotifications } from "@/lib/notifications";

export async function GET() {
  const notifications = await fetchUnreadNotifications();

  return Response.json({ notifications });
}

