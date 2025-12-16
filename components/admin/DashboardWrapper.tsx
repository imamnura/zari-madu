"use client";

import { ReactNode, useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Listen to localStorage changes for sidebar state
  useEffect(() => {
    const checkSidebarState = () => {
      const savedState = localStorage.getItem("sidebarExpanded");
      if (savedState !== null) {
        setSidebarExpanded(savedState === "true");
      }
    };

    checkSidebarState();

    // Listen for storage events
    window.addEventListener("storage", checkSidebarState);

    // Also check periodically for same-tab changes
    const interval = setInterval(checkSidebarState, 100);

    return () => {
      window.removeEventListener("storage", checkSidebarState);
      clearInterval(interval);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
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
