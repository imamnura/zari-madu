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
      name: "Admin Zari Life",
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
      heading: "Tentang Zari Life",
      body: "Zari Life hadir dengan komitmen menghadirkan madu dan hasil alam Indonesia yang premium, murni, dan berkualitas tinggi. Kami bekerja langsung dengan peternak lokal terpilih untuk memastikan setiap produk memenuhi standar kualitas tertinggi.",
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
      heading: "Mengapa Memilih Zari Life?",
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
      title: "Ribuan pelanggan puas telah merasakan kualitas Zari Life",
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
