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
