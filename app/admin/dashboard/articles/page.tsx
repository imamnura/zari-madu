"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  X,
  Calendar,
  Clock,
  Tag,
  LinkIcon,
  Upload,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import TiptapEditor from "@/components/admin/TiptapEditor";

// Category options
const CATEGORIES = [
  "Kesehatan",
  "Tips",
  "Resep",
  "Behind The Scene",
  "Produk",
  "Lifestyle",
  "Edukasi",
];

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
  tags: string[];
}

interface ArticleContent {
  heading: string;
  title: string;
  description: string;
  articles: Article[];
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ArticlesPage() {
  const [content, setContent] = useState<ArticleContent>({
    heading: "",
    title: "",
    description: "",
    articles: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Article form states
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [excerptInput, setExcerptInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [readTimeInput, setReadTimeInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Image upload states
  const [imageUploadType, setImageUploadType] = useState<"url" | "file">("url");
  const [showImageInfo, setShowImageInfo] = useState(false);

  // Debounced image URL for preview
  const debouncedImageUrl = useDebounce(imageInput, 500);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/admin/articles-content");
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching articles content:", error);
        toast.error("Gagal memuat data artikel");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Validation
  const isMainFormValid = () => {
    return (
      content.heading.trim().length >= 5 &&
      content.title.trim().length > 0 &&
      content.description.trim().length > 0 &&
      content.articles.length >= 1
    );
  };

  const isArticleFormValid = () => {
    return (
      titleInput.trim().length >= 5 &&
      excerptInput.trim().length >= 10 &&
      imageInput.trim().length > 0 &&
      categoryInput.trim().length > 0 &&
      authorInput.trim().length > 0 &&
      dateInput.trim().length > 0 &&
      readTimeInput.trim().length > 0 &&
      contentInput.trim().length >= 10 &&
      tagsArray.length > 0
    );
  };

  // Handle save
  const handleSave = async () => {
    if (!isMainFormValid()) {
      toast.error("Pastikan semua field terisi dengan benar");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/articles-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        toast.success("Artikel content berhasil disimpan!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menyimpan artikel content");
      }
    } catch (error) {
      console.error("Error saving articles content:", error);
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  // Open add article form
  const handleAddArticle = () => {
    setEditingArticleId(null);
    setTitleInput("");
    setExcerptInput("");
    setImageInput("");
    setCategoryInput("");
    setAuthorInput("");
    setDateInput(format(new Date(), "dd MMMM yyyy", { locale: localeId }));
    setReadTimeInput("");
    setContentInput("");
    setTagInput("");
    setTagsArray([]);
    setShowArticleForm(true);
  };

  // Open edit article form
  const handleEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setTitleInput(article.title);
    setExcerptInput(article.excerpt);
    setImageInput(article.image);
    setCategoryInput(article.category);
    setAuthorInput(article.author);
    setDateInput(article.date);
    setReadTimeInput(article.readTime);
    setContentInput(article.content);
    setTagsArray(article.tags);
    setShowArticleForm(true);
  };

  // Save article
  const handleSaveArticle = () => {
    if (!isArticleFormValid()) {
      toast.error("Pastikan semua field artikel terisi dengan benar");
      return;
    }

    const slug = generateSlug(titleInput);
    const newArticle: Article = {
      id: editingArticleId || Date.now(),
      slug,
      title: titleInput,
      excerpt: excerptInput,
      image: imageInput,
      category: categoryInput,
      author: authorInput,
      date: dateInput,
      readTime: readTimeInput,
      content: contentInput,
      tags: tagsArray,
    };

    if (editingArticleId) {
      // Update existing article
      setContent({
        ...content,
        articles: content.articles.map((a) =>
          a.id === editingArticleId ? newArticle : a
        ),
      });
      toast.success("Artikel berhasil diupdate!");
    } else {
      // Add new article
      setContent({
        ...content,
        articles: [...content.articles, newArticle],
      });
      toast.success("Artikel berhasil ditambahkan!");
    }

    setShowArticleForm(false);
  };

  // Delete article
  const handleDeleteArticle = (id: number) => {
    if (confirm("Hapus artikel ini?")) {
      setContent({
        ...content,
        articles: content.articles.filter((a) => a.id !== id),
      });
      toast.success("Artikel berhasil dihapus!");
    }
  };

  // Add tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tagsArray.includes(trimmedTag)) {
      setTagsArray([...tagsArray, trimmedTag]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTagsArray(tagsArray.filter((t) => t !== tag));
  };

  // Handle image file upload (convert to base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageInput(reader.result as string);
      toast.success("Gambar berhasil diupload!");
    };
    reader.onerror = () => {
      toast.error("Gagal membaca file");
    };
    reader.readAsDataURL(file);
  };

  // Filter categories based on search
  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📰 Artikel Management
          </h1>
          <p className="text-gray-600">
            Kelola konten artikel dan tips untuk edukasi pelanggan
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Section Content
          </h2>

          <div className="space-y-4">
            {/* Heading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Min 5 karakter)
                </span>
              </label>
              <input
                type="text"
                value={content.heading}
                onChange={(e) =>
                  setContent({ ...content, heading: e.target.value })
                }
                placeholder="Contoh: Artikel & Tips"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                placeholder="Contoh: Edukasi Sehat dengan Madu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description Section <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content.description}
                onChange={(e) =>
                  setContent({ ...content, description: e.target.value })
                }
                placeholder="Deskripsi singkat tentang section artikel..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Artikel List
              </h2>
              <p className="text-sm text-gray-600">
                Total: {content.articles.length} artikel
              </p>
            </div>
            <Button
              onClick={handleAddArticle}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Artikel
            </Button>
          </div>

          {content.articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada artikel. Klik tombol di atas untuk menambahkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.articles.map((article) => (
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                      {article.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{article.date}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{article.readTime}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditArticle(article)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteArticle(article.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Button
            onClick={handleSave}
            disabled={!isMainFormValid() || saving}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
          {!isMainFormValid() && (
            <p className="text-sm text-red-600 mt-2 text-center">
              {content.heading.trim().length < 5 &&
                "Heading minimal 5 karakter. "}
              {content.title.trim().length === 0 &&
                "Title tidak boleh kosong. "}
              {content.description.trim().length === 0 &&
                "Description tidak boleh kosong. "}
              {content.articles.length === 0 && "Minimal 1 artikel diperlukan."}
            </p>
          )}
        </div>
      </div>

      {/* Article Form Modal */}
      {showArticleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingArticleId ? "Edit Artikel" : "Tambah Artikel Baru"}
              </h2>
              <button
                onClick={() => setShowArticleForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Artikel <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Min 5 karakter)
                  </span>
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Masukkan judul artikel..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                {titleInput && (
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {generateSlug(titleInput)}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Min 10 karakter)
                  </span>
                </label>
                <textarea
                  value={excerptInput}
                  onChange={(e) => setExcerptInput(e.target.value)}
                  placeholder="Ringkasan singkat artikel..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Featured Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        imageUploadType === "url" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setImageUploadType("url")}
                      className="text-xs h-auto py-1 px-2"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={
                        imageUploadType === "file" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setImageUploadType("file")}
                      className="text-xs h-auto py-1 px-2"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImageInfo(!showImageInfo)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      <Info className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {showImageInfo && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                    <p className="font-semibold mb-1">💡 Tips Upload Image:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>URL:</strong> Paste link dari Google Drive,
                        Imgur, atau image hosting lain
                      </li>
                      <li>
                        <strong>Upload File:</strong> File akan dikonversi ke
                        base64 dan disimpan di database (max 2MB)
                      </li>
                      <li>
                        Recommended size: 1200x630px untuk optimal display
                      </li>
                    </ul>
                  </div>
                )}

                {imageUploadType === "url" ? (
                  <>
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                    {debouncedImageUrl && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Preview:
                        </p>
                        <div className="aspect-video bg-white rounded border border-gray-200 overflow-hidden">
                          <img
                            src={debouncedImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="flex items-center justify-center w-full h-full text-red-500 text-sm">❌ Invalid image URL</div>';
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {imageInput && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Preview:
                        </p>
                        <div className="aspect-video bg-white rounded border border-gray-200 overflow-hidden">
                          <img
                            src={imageInput}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={categorySearch || categoryInput}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setCategoryInput(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder="Pilih atau ketik kategori..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategoryInput(cat);
                              setCategorySearch("");
                              setShowCategoryDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors"
                          >
                            {cat}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          Tidak ada kategori yang cocok
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Author & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    placeholder="Nama penulis..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Publikasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    placeholder="dd MMMM yyyy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format:{" "}
                    {format(new Date(), "dd MMMM yyyy", { locale: localeId })}
                  </p>
                </div>
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Baca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={readTimeInput}
                  onChange={(e) => setReadTimeInput(e.target.value)}
                  placeholder="Contoh: 5 min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ketik tag dan Enter..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                {tagsArray.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten Artikel <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Min 10 karakter, gunakan toolbar untuk formatting)
                  </span>
                </label>
                <TiptapEditor
                  content={contentInput}
                  onChange={setContentInput}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                onClick={() => setShowArticleForm(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveArticle}
                disabled={!isArticleFormValid()}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingArticleId ? "Update Artikel" : "Tambah Artikel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
