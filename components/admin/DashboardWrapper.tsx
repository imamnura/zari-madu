"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarExpanded } from "@/hooks/useSidebarExpanded";

interface DashboardWrapperProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DashboardWrapper({
  children,
  user,
}: DashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Satu sumber state untuk sidebar dan padding konten (tanpa polling localStorage)
  const [sidebarExpanded, toggleSidebarExpanded] = useSidebarExpanded();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isExpanded={sidebarExpanded}
        onToggleExpanded={toggleSidebarExpanded}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarExpanded ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        <AdminHeader user={user} onMenuClick={toggleSidebar} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
