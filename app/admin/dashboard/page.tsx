import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, FileText, Users, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Total Pengunjung",
      value: "12,543",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Artikel Dipublikasi",
      value: "24",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Konversi",
      value: "8.2%",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const quickLinks = [
    {
      title: "Edit Hero Section",
      description: "Kelola konten bagian hero landing page",
      href: "/admin/dashboard/hero",
      icon: Home,
    },
    {
      title: "Kelola Artikel",
      description: "Tambah, edit, atau hapus artikel",
      href: "/admin/dashboard/articles",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang di Dashboard Admin
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Kelola seluruh konten landing page Zari Life dari sini
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 sm:p-4 rounded-lg`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="border-2 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-50 p-3 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
