import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import DashboardWrapper from "@/components/admin/DashboardWrapper";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  return <DashboardWrapper user={session.user}>{children}</DashboardWrapper>;
}
