import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ArticlesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kelola Artikel
        </h1>
        <p className="text-gray-600">Manajemen artikel untuk landing page</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Fitur Dalam Pengembangan</h3>
              <p className="text-sm text-gray-600">
                Fitur manajemen artikel akan segera tersedia
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Saat ini Anda dapat mengelola konten Hero Section melalui menu di
            sidebar. Fitur manajemen artikel lengkap akan ditambahkan dalam
            update berikutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
