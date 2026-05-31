import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function redirectSignedInUserToDashboard() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
}

export async function requireDashboardUser() {
  await auth.protect();

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return user;
}

export function isAdminUser(user: Awaited<ReturnType<typeof currentUser>>) {
  return user?.publicMetadata?.role === "admin";
}

export async function requireAdminUser() {
  const user = await requireDashboardUser();

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  return user;
}
