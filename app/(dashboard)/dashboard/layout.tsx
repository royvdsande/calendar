import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DashboardHeader } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader name={session.user.name} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
