import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import OwnerDashboardClient from "./dashboard-client";
import { Session } from "next-auth";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner") {
    redirect("/auth/signin?callbackUrl=/dashboard/owner");
  }

  return <OwnerDashboardClient session={session} />;
}
