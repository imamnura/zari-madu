"use client";

import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onMenuClick: () => void;
}

export default function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard Admin
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              Kelola konten landing page Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* User info - hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                {user.email}
              </p>
            </div>
          </div>

          {/* User icon only on mobile */}
          <div className="sm:hidden flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            size="sm"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
