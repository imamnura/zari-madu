import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@zarilife.com" },
    update: {},
    create: {
      email: "admin@zarilife.com",
      password: hashedPassword,
      name: "Admin Zari Honey",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create default hero content
  const heroContent = await prisma.heroContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      badges: JSON.stringify([
        "100% Raw Honey",
        "Single-Origin",
        "Lab Tested",
        "Premium Quality",
      ]),
      typewriterTexts: JSON.stringify([
        "Madu Premium Asli dari Alam Indonesia",
        "Kualitas Terpercaya - Tanpa Aditif",
      ]),
      description:
        "Nikmati kemurnian alam dalam setiap tetes. 100% murni, tanpa campuran, langsung dari sumbernya.",
      productImage: null,
    },
  });

  console.log("✅ Hero content created");

  // Create default about content
  const aboutContent = await prisma.aboutContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      tagline: "Terpercaya & Berkualitas",
      heading: "Tentang Zari Honey",
      body: "Zari Honey hadir dengan komitmen menghadirkan madu dan hasil alam Indonesia yang premium, murni, dan berkualitas tinggi. Kami bekerja langsung dengan peternak lokal terpilih untuk memastikan setiap produk memenuhi standar kualitas tertinggi.",
      stats: JSON.stringify([
        { value: "1M+", label: "Pelanggan Puas" },
        { value: "100%", label: "Madu Murni" },
        { value: "50+", label: "Sumber Panen" },
        { value: "10+", label: "Tahun Pengalaman" },
      ]),
    },
  });

  console.log("✅ About content created");

  // Create default why choose content
  const whyChooseContent = await prisma.whyChooseContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heading: "Mengapa Memilih Zari Honey?",
      title: "Komitmen kami pada kualitas dan kepuasan Anda",
      criteria: JSON.stringify([
        {
          icon: "ShieldCheck",
          title: "Jaminan Kemurnian",
          description:
            "100% madu murni tanpa campuran gula atau bahan lain. Tersertifikasi lab independen.",
        },
        {
          icon: "Sparkles",
          title: "Premium Quality",
          description:
            "Dipilih dari sumber terbaik dengan standar kualitas tertinggi untuk pengalaman premium.",
        },
        {
          icon: "Leaf",
          title: "Natural & Organic",
          description:
            "Diproses minimal untuk mempertahankan enzim, vitamin, dan mineral alami.",
        },
        {
          icon: "MapPin",
          title: "Single-Origin",
          description:
            "Setiap varian berasal dari satu sumber nektar untuk rasa dan aroma yang khas.",
        },
        {
          icon: "Users",
          title: "Mendukung Peternak Lokal",
          description:
            "Bermitra langsung dengan peternak lebah lokal untuk keberlanjutan ekonomi.",
        },
        {
          icon: "Award",
          title: "Trusted Brand",
          description:
            "Dipercaya lebih dari 1 juta pelanggan di seluruh Indonesia.",
        },
      ]),
    },
  });

  console.log("✅ Why Choose content created");

  // Create default testimonial content
  const testimonialContent = await prisma.testimonialContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heading: "Apa Kata Mereka?",
      title: "Ribuan pelanggan puas telah merasakan kualitas Zari Honey",
      testimonials: JSON.stringify([
        {
          id: 1,
          name: "Ibu Sari",
          city: "Jakarta",
          text: "Madu Zari benar-benar premium! Rasanya berbeda dari madu biasa. Anak-anak saya suka dan keluarga jadi lebih sehat.",
          rating: 5,
        },
        {
          id: 2,
          name: "Bapak Rizki",
          city: "Bandung",
          text: "Sudah jadi reseller Zari 2 tahun. Produknya mudah dijual karena kualitasnya terjamin dan packagingnya premium.",
          rating: 5,
        },
        {
          id: 3,
          name: "Ibu Dina",
          city: "Surabaya",
          text: "Cocok untuk hampers kantor. Klien-klien saya sangat puas dengan kualitas dan kemasannya yang elegan.",
          rating: 5,
        },
        {
          id: 4,
          name: "Bapak Ahmad",
          city: "Yogyakarta",
          text: "Madu hutan liarnya juara! Keasliannya terasa, cocok untuk jaga stamina dan kesehatan.",
          rating: 5,
        },
      ]),
    },
  });

  console.log("✅ Testimonial content created");

  // Create default partnership content
  const partnershipContent = await prisma.partnershipContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heading: "Partner & Sertifikasi",
      title:
        "Dipercaya dan bersertifikat resmi dari berbagai lembaga terkemuka",
      partnerships: JSON.stringify([
        {
          id: 1,
          name: "Asosiasi Perlebahan Indonesia",
          logo: "/images/partners/api.png",
          description: "Partner resmi dalam pengembangan industri perlebahan",
        },
        {
          id: 2,
          name: "BPOM RI",
          logo: "/images/partners/bpom.png",
          description: "Tersertifikasi dan terdaftar resmi",
        },
        {
          id: 3,
          name: "Halal MUI",
          logo: "/images/partners/mui.png",
          description: "Bersertifikat Halal MUI",
        },
        {
          id: 4,
          name: "SGS Lab",
          logo: "/images/partners/sgs.png",
          description: "Teruji laboratorium internasional",
        },
        {
          id: 5,
          name: "Organic Indonesia",
          logo: "/images/partners/organic.png",
          description: "Certified organic products",
        },
        {
          id: 6,
          name: "Koperasi Peternak Lebah",
          logo: "/images/partners/koperasi.png",
          description: "Mendukung peternak lokal",
        },
      ]),
    },
  });

  console.log("✅ Partnership content created");

  // Create default article content
  const articleContent = await prisma.articleContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heading: "Artikel & Tips",
      title: "Edukasi Sehat dengan Madu",
      description:
        "Pelajari lebih dalam tentang dunia madu, kesehatan, dan gaya hidup sehat melalui artikel-artikel pilihan kami.",
      articles: JSON.stringify([
        {
          id: 1,
          slug: "manfaat-madu-untuk-kesehatan",
          title: "10 Manfaat Madu untuk Kesehatan yang Wajib Anda Ketahui",
          excerpt:
            "Madu bukan hanya pemanis alami, tapi juga memiliki segudang manfaat untuk kesehatan tubuh. Simak 10 manfaat luar biasa dari madu murni.",
          image: "/images/articles/manfaat-madu.jpg",
          category: "Kesehatan",
          author: "Dr. Sarah Nutrition",
          date: "10 Desember 2025",
          readTime: "5 min",
          content: `<h2>Madu: Superfood Alami dari Alam</h2><p>Madu telah digunakan sejak ribuan tahun lalu sebagai obat alami dan sumber nutrisi. Produk alami ini mengandung berbagai vitamin, mineral, enzim, dan antioksidan yang sangat bermanfaat bagi kesehatan tubuh kita.</p><h3>1. Meningkatkan Sistem Kekebalan Tubuh</h3><p>Madu murni mengandung antioksidan dan antibakteri yang membantu melawan infeksi dan meningkatkan sistem imun tubuh.</p>`,
          tags: ["kesehatan", "madu", "nutrisi"],
        },
        {
          id: 2,
          slug: "cara-membedakan-madu-asli-dan-palsu",
          title: "Cara Mudah Membedakan Madu Asli dan Palsu",
          excerpt:
            "Tips praktis untuk mengidentifikasi madu murni dan menghindari produk palsu di pasaran.",
          image: "/images/articles/madu-asli.jpg",
          category: "Tips",
          author: "Tim Zari Honey",
          date: "8 Desember 2025",
          readTime: "4 min",
          content: `<h2>Kenali Ciri-ciri Madu Asli</h2><p>Dengan maraknya madu palsu di pasaran, penting untuk mengetahui cara membedakan madu asli dan palsu.</p><h3>1. Tes Air</h3><p>Teteskan madu ke dalam segelas air dingin. Madu asli akan tenggelam dan mengendap di dasar gelas.</p>`,
          tags: ["tips", "madu asli", "edukasi"],
        },
        {
          id: 3,
          slug: "resep-minuman-sehat-dengan-madu",
          title:
            "5 Resep Minuman Sehat dengan Madu untuk Meningkatkan Imunitas",
          excerpt:
            "Kreasi minuman sehat berbahan dasar madu yang mudah dibuat di rumah untuk menjaga kesehatan keluarga.",
          image: "/images/articles/resep-madu.jpg",
          category: "Resep",
          author: "Chef Healthy",
          date: "5 Desember 2025",
          readTime: "6 min",
          content: `<h2>Minuman Sehat untuk Keluarga</h2><p>Madu bisa diolah menjadi berbagai minuman sehat yang nikmat dan mudah dibuat di rumah.</p><h3>1. Lemon Honey Tea</h3><p>Campurkan air lemon dan madu dalam air hangat untuk minuman yang menyegarkan.</p>`,
          tags: ["resep", "minuman", "imunitas"],
        },
        {
          id: 4,
          slug: "proses-produksi-madu-zari-life",
          title: "Di Balik Layar: Proses Produksi Madu Zari Honey",
          excerpt:
            "Ikuti perjalanan madu dari sarang lebah hingga botol premium di tangan Anda.",
          image: "/images/articles/produksi.jpg",
          category: "Behind The Scene",
          author: "Tim Zari Honey",
          date: "1 Desember 2025",
          readTime: "7 min",
          content: `<h2>Dari Hutan ke Meja Anda</h2><p>Setiap botol madu Zari Honey melalui proses yang ketat dan penuh perhatian untuk memastikan kualitas premium sampai ke tangan Anda.</p>`,
          tags: ["produksi", "kualitas", "behind the scene"],
        },
      ]),
    },
  });

  console.log("✅ Article content created");

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      whatsapp: "+6285777578827",
      instagram: "https://www.instagram.com/zarihoney",
      email: "info@zarilife.com",
      shopeeLink: "https://id.shp.ee/GgH8AKs",
      mapsLocation: "https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8",
      mapsEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15856.26522818341!2d107.44402569879621!3d-6.513291791330821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e690d5a79b9f5f7%3A0x8213696bb15cd519!2sToko%20Madu%20ZARI%20HONEY%20%7C%20Pusat%20Dan%20Grosir%20Madu%20Asli%20(Murni)!5e0!3m2!1sen!2sid!4v1765776563151!5m2!1sen!2sid",
    },
  });

  console.log("✅ Default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
