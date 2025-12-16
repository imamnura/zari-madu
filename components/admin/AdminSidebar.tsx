"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Award,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Hero Section",
    href: "/admin/dashboard/hero",
    icon: Home,
  },
  {
    label: "About Section",
    href: "/admin/dashboard/about",
    icon: Info,
  },
  {
    label: "Why Choose",
    href: "/admin/dashboard/why-choose",
    icon: Award,
  },
  {
    label: "Testimonials",
    href: "/admin/dashboard/testimonials",
    icon: MessageSquare,
  },
  {
    label: "Artikel",
    href: "/admin/dashboard/articles",
    icon: FileText,
  },
  {
    label: "Pengaturan",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  // Load expanded state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarExpanded");
    if (savedState !== null) {
      setIsExpanded(savedState === "true");
    }
  }, []);

  // Save expanded state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("sidebarExpanded", String(newState));
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isExpanded ? "w-64" : "w-20"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-6 py-5 border-b border-gray-200 ${
              !isExpanded && "px-4 justify-center"
            }`}
          >
            <div className="text-3xl flex-shrink-0">🍯</div>
            {isExpanded && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-gray-900 whitespace-nowrap">
                  Zari Life
                </h1>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  Admin Panel
                </p>
              </div>
            )}
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${!isExpanded && "justify-center"}
                    ${
                      isActive
                        ? "bg-amber-50 text-amber-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button - Desktop only */}
          <div className="hidden lg:block px-4 py-4 border-t border-gray-200">
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isExpanded ? (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Tutup</span>
                </>
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Footer */}
          {isExpanded && (
            <div className="px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Zari Life
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
