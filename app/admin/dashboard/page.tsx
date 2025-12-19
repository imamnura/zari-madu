"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Home,
  FileText,
  Users,
  Heart,
  Boxes,
  Handshake,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    articles: 0,
    honeyCollections: 0,
    testimonials: 0,
    partnerships: 0,
  });

  const [visitorData, setVisitorData] = useState<number[]>([
    45, 52, 48, 65, 58, 70, 85,
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            articles: data.data.articleCount,
            honeyCollections: data.data.honeyCollectionCount,
            testimonials: data.data.testimonialCount,
            partnerships: data.data.partnershipCount,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      label: "Artikel",
      value: stats.articles,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total artikel published",
    },
    {
      label: "Produk Madu",
      value: stats.honeyCollections,
      icon: Boxes,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Koleksi madu tersedia",
    },
    {
      label: "Testimonial",
      value: stats.testimonials,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Review pelanggan",
    },
    {
      label: "Partnership",
      value: stats.partnerships,
      icon: Handshake,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Mitra & sertifikasi",
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

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const maxVisitor = Math.max(...visitorData);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header dengan gradient */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-6 sm:p-8 border-2 border-amber-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard Admin Zari Honey
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 ml-14">
          Kelola seluruh konten website dengan mudah dan cepat
        </p>
      </div>

      {/* Stats Grid dengan 4 kolom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-2 hover:border-amber-300 hover:shadow-lg transition-all"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <div className={`${stat.bgColor} p-3 rounded-lg self-start`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Visitor Analytics Chart */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Aktivitas Pengunjung
              </CardTitle>
              <CardDescription className="mt-1">
                Data pengunjung 7 hari terakhir
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>7 Hari Terakhir</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48">
              {visitorData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="flex-1 w-full flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg hover:from-blue-600 hover:to-blue-400 transition-all cursor-pointer relative group"
                      style={{
                        height: `${(value / maxVisitor) * 100}%`,
                        minHeight: "20px",
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value} pengunjung
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {days[index]}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">
                    Pengunjung Website
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-bold text-gray-900">
                  {visitorData.reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
