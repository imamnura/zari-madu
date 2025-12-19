// Constants and static content for Zari Honey landing page

export const CONTACT_INFO = {
  whatsapp: "+6285777578827",
  email: "info@zarilife.com",
  instagram: "https://www.instagram.com/zarihoney",
  shopee: "https://id.shp.ee/GgH8AKs",
  maps: "https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15856.26522818341!2d107.44402569879621!3d-6.513291791330821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e690d5a79b9f5f7%3A0x8213696bb15cd519!2sToko%20Madu%20ZARI%20HONEY%20%7C%20Pusat%20Dan%20Grosir%20Madu%20Asli%20(Murni)!5e0!3m2!1sen!2sid!4v1765776563151!5m2!1sen!2sid",
};

export const WHATSAPP_MESSAGES = {
  order:
    "Halo Zari, saya tertarik memesan madu premium. Mohon info detail & harganya.",
  reseller:
    "Halo Zari, saya tertarik menjadi reseller premium. Mohon informasi lebih lanjut.",
};

export const RUNNING_TEXT = [
  "🍯 100% Madu Murni Tanpa Campuran",
  "✨ Tersertifikasi Lab Independen",
  "🌿 Direct dari Peternak Lokal Terpilih",
  "🏆 Dipercaya 1 Juta+ Pelanggan",
  "🚚 Pengiriman ke Seluruh Indonesia",
  "💎 Premium Quality, Harga Terjangkau",
];

export const HERO_CONTENT = {
  headline: "Madu Premium Asli dari Alam Indonesia",
  subheadline:
    "Nikmati kemurnian alam dalam setiap tetes. 100% murni, tanpa campuran, langsung dari sumbernya.",
  badges: ["100% Raw Honey", "Single-Origin", "Lab Tested", "Premium Quality"],
};

export const ABOUT_CONTENT = {
  heading: "Tentang Zari Honey",
  body: "Zari Honey hadir dengan komitmen menghadirkan madu dan hasil alam Indonesia yang premium, murni, dan berkualitas tinggi. Kami bekerja langsung dengan peternak lokal terpilih untuk memastikan setiap produk memenuhi standar kualitas tertinggi.",
  stats: [
    { value: "1M+", label: "Pelanggan Puas" },
    { value: "100%", label: "Madu Murni" },
    { value: "50+", label: "Sumber Panen" },
    { value: "10+", label: "Tahun Pengalaman" },
  ],
};

export const PRODUCT_LINES = [
  {
    id: "zarihoney",
    name: "ZariHoney",
    description:
      "Koleksi madu premium dari berbagai sumber nektar pilihan. Murni, natural, dan kaya manfaat.",
    icon: "🍯",
    products: [
      {
        id: "madu-hutan",
        name: "Madu Hutan Liar",
        description:
          "Madu premium dari nektar bunga hutan liar. Rasa kuat, kaya antioksidan dan mineral alami.",
        price: "Rp 150.000",
        size: "500ml",
        label: "Best Seller",
        benefits: [
          "Meningkatkan stamina",
          "Antioksidan tinggi",
          "Boost imunitas",
        ],
        image: "/images/products/madu-hutan.jpg",
      },
      {
        id: "madu-rambutan",
        name: "Madu Rambutan",
        description:
          "Madu eksklusif dari bunga rambutan. Rasa ringan, manis alami, cocok untuk segala usia.",
        price: "Rp 125.000",
        size: "500ml",
        label: "Signature",
        benefits: [
          "Vitamin C tinggi",
          "Cocok untuk anak",
          "Rasa manis natural",
        ],
        image: "/images/products/madu-rambutan.jpg",
      },
      {
        id: "madu-kaliandra",
        name: "Madu Kaliandra",
        description:
          "Madu premium dari bunga kaliandra. Warna cerah, aroma floral khas.",
        price: "Rp 135.000",
        size: "500ml",
        label: "Light & Floral",
        benefits: [
          "Aroma menenangkan",
          "Tekstur lembut",
          "Cocok untuk relaksasi",
        ],
        image: "/images/products/madu-kaliandra.jpg",
      },
      {
        id: "madu-kelengkeng",
        name: "Madu Kelengkeng",
        description:
          "Madu istimewa dari bunga kelengkeng. Tekstur smooth, cocok untuk keluarga.",
        price: "Rp 140.000",
        size: "500ml",
        label: "Family Favorite",
        benefits: ["Nutrisi lengkap", "Rasa enak", "Favorit keluarga"],
        image: "/images/products/madu-kelengkeng.jpg",
      },
    ],
  },
  {
    id: "zarico",
    name: "ZariCo",
    description:
      "Produk turunan madu berkualitas tinggi untuk gaya hidup sehat dan modern.",
    icon: "🥛",
    products: [
      {
        id: "royal-jelly",
        name: "Royal Jelly Premium",
        description:
          "Kombinasi madu murni dengan royal jelly segar untuk kesehatan optimal.",
        price: "Rp 200.000",
        size: "250ml",
        label: "Premium",
        benefits: ["Anti aging", "Energi ekstra", "Kesehatan kulit"],
        image: "/images/products/royal-jelly.jpg",
      },
      {
        id: "propolis",
        name: "Propolis Extract",
        description:
          "Ekstrak propolis murni dengan kandungan antibiotik alami.",
        price: "Rp 180.000",
        size: "30ml",
        label: "Healing Power",
        benefits: ["Antibakteri alami", "Menyembuhkan luka", "Boost imun"],
        image: "/images/products/propolis.jpg",
      },
      {
        id: "bee-pollen",
        name: "Bee Pollen",
        description: "Serbuk sari lebah kaya nutrisi dan vitamin lengkap.",
        price: "Rp 165.000",
        size: "200g",
        label: "Superfood",
        benefits: ["Vitamin lengkap", "Protein tinggi", "Energi natural"],
        image: "/images/products/bee-pollen.jpg",
      },
    ],
  },
  {
    id: "zarifarm",
    name: "ZariFarm",
    description:
      "Hasil alam premium lainnya dari perkebunan terpilih untuk kesehatan optimal.",
    icon: "🌿",
    products: [
      {
        id: "kurma-madu",
        name: "Kurma Madu Premium",
        description:
          "Kurma pilihan direndam dalam madu murni untuk nutrisi maksimal.",
        price: "Rp 95.000",
        size: "250g",
        label: "Nutritious",
        benefits: ["Energi cepat", "Serat tinggi", "Cocok sahur & buka puasa"],
        image: "/images/products/kurma-madu.jpg",
      },
      {
        id: "jahe-madu",
        name: "Jahe Madu",
        description:
          "Kombinasi jahe merah pilihan dengan madu murni untuk kehangatan tubuh.",
        price: "Rp 85.000",
        size: "300ml",
        label: "Warming",
        benefits: [
          "Menghangatkan badan",
          "Melancarkan peredaran",
          "Cocok musim hujan",
        ],
        image: "/images/products/jahe-madu.jpg",
      },
      {
        id: "lemon-madu",
        name: "Lemon Madu",
        description: "Perasan lemon segar dengan madu murni untuk detox alami.",
        price: "Rp 90.000",
        size: "300ml",
        label: "Detox",
        benefits: ["Detox natural", "Vitamin C tinggi", "Segar & sehat"],
        image: "/images/products/lemon-madu.jpg",
      },
    ],
  },
];

export const WHY_CHOOSE_ZARI = [
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
    description: "Dipercaya lebih dari 1 juta pelanggan di seluruh Indonesia.",
  },
];

export const PRODUCTS_SHOWCASE = [
  {
    id: "madu-hutan",
    name: "Madu Hutan Liar",
    description:
      "Madu premium dari nektar bunga hutan liar. Rasa kuat, kaya antioksidan.",
    label: "Best Seller",
    image: "/images/products/madu-hutan.jpg",
  },
  {
    id: "madu-rambutan",
    name: "Madu Rambutan",
    description:
      "Madu eksklusif dari bunga rambutan. Rasa ringan, manis alami.",
    label: "Signature",
    image: "/images/products/madu-rambutan.jpg",
  },
  {
    id: "madu-kaliandra",
    name: "Madu Kaliandra",
    description:
      "Madu premium dari bunga kaliandra. Warna cerah, aroma floral.",
    label: "Light & Floral",
    image: "/images/products/madu-kaliandra.jpg",
  },
  {
    id: "madu-kelengkeng",
    name: "Madu Kelengkeng",
    description:
      "Madu istimewa dari bunga kelengkeng. Tekstur smooth, cocok untuk keluarga.",
    label: "Family Favorite",
    image: "/images/products/madu-kelengkeng.jpg",
  },
];

export const TESTIMONIALS = [
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
];

export const PARTNERSHIPS = [
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
];

export const ARTICLES = [
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
    content: `
      <h2>Madu: Superfood Alami dari Alam</h2>
      <p>Madu telah digunakan sejak ribuan tahun lalu sebagai obat alami dan sumber nutrisi. Produk alami ini mengandung berbagai vitamin, mineral, enzim, dan antioksidan yang sangat bermanfaat bagi kesehatan tubuh kita.</p>
      
      <h3>1. Meningkatkan Sistem Kekebalan Tubuh</h3>
      <p>Madu murni mengandung antioksidan dan antibakteri yang membantu melawan infeksi dan meningkatkan sistem imun tubuh. Konsumsi rutin madu dapat membantu tubuh lebih resisten terhadap penyakit.</p>
      
      <h3>2. Sumber Energi Natural</h3>
      <p>Kandungan gula alami dalam madu, seperti fruktosa dan glukosa, memberikan energi instan yang dibutuhkan tubuh. Ideal dikonsumsi sebelum atau sesudah aktivitas fisik.</p>
      
      <h3>3. Membantu Pencernaan</h3>
      <p>Madu membantu meredakan gangguan pencernaan seperti diare dan sembelit. Enzim alami dalam madu membantu proses pencernaan makanan menjadi lebih baik.</p>
      
      <h3>4. Meredakan Batuk dan Tenggorokan</h3>
      <p>Madu efektif meredakan batuk dan sakit tenggorokan. Teksturnya yang kental melapisi tenggorokan dan memberikan efek menenangkan.</p>
      
      <h3>5. Merawat Kulit</h3>
      <p>Kandungan antibakteri dan antioksidan dalam madu sangat baik untuk perawatan kulit. Dapat digunakan sebagai masker wajah alami untuk melembabkan dan mencerahkan kulit.</p>
      
      <h3>6. Membantu Tidur Lebih Nyenyak</h3>
      <p>Konsumsi madu sebelum tidur dapat membantu melepaskan hormon melatonin yang membuat tidur lebih berkualitas.</p>
      
      <h3>7. Menurunkan Risiko Penyakit Jantung</h3>
      <p>Antioksidan dalam madu dapat membantu menurunkan tekanan darah dan kolesterol, yang merupakan faktor risiko penyakit jantung.</p>
      
      <h3>8. Mengontrol Gula Darah</h3>
      <p>Meskipun manis, madu memiliki indeks glikemik lebih rendah dibanding gula biasa dan dapat membantu mengatur gula darah dengan lebih baik.</p>
      
      <h3>9. Membantu Penyembuhan Luka</h3>
      <p>Sifat antibakteri madu efektif dalam membantu penyembuhan luka dan luka bakar ketika dioleskan pada kulit.</p>
      
      <h3>10. Kaya Nutrisi Penting</h3>
      <p>Madu mengandung berbagai vitamin seperti B kompleks, vitamin C, serta mineral seperti kalsium, zat besi, zinc, dan magnesium.</p>
      
      <p><strong>Kesimpulan:</strong> Madu adalah superfood alami yang memberikan banyak manfaat kesehatan. Pilih madu murni berkualitas tinggi seperti produk Zari Honey untuk mendapatkan manfaat maksimal.</p>
    `,
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
    content: `
      <h2>Kenali Ciri-ciri Madu Asli</h2>
      <p>Dengan maraknya madu palsu di pasaran, penting untuk mengetahui cara membedakan madu asli dan palsu. Berikut adalah panduan lengkap untuk memastikan Anda mendapatkan madu murni berkualitas.</p>
      
      <h3>1. Tes Air</h3>
      <p>Teteskan madu ke dalam segelas air dingin. Madu asli akan tenggelam dan mengendap di dasar gelas, tidak langsung larut. Madu palsu cenderung langsung menyebar dan larut dalam air.</p>
      
      <h3>2. Tes Kertas</h3>
      <p>Teteskan madu di atas kertas atau tisu. Madu asli tidak akan merembes ke kertas karena kandungan airnya rendah. Madu palsu akan meninggalkan bekas basah karena mengandung banyak air.</p>
      
      <h3>3. Tes Api</h3>
      <p>Celupkan korek api ke dalam madu, kemudian coba nyalakan. Madu asli akan membuat korek tetap bisa menyala karena tidak mengandung banyak air. Madu palsu akan membuat korek sulit atau tidak bisa menyala.</p>
      
      <h3>4. Perhatikan Tekstur dan Konsistensi</h3>
      <p>Madu asli memiliki tekstur yang kental dan lembut. Ketika dituang, madu asli mengalir perlahan dan membentuk gumpalan yang tidak langsung menyebar. Madu palsu cenderung encer dan langsung menyebar.</p>
      
      <h3>5. Aroma Khas</h3>
      <p>Madu asli memiliki aroma alami yang khas dari bunga atau tanaman sumber nektarnya. Madu palsu biasanya memiliki aroma yang terlalu manis atau tidak ada aroma sama sekali.</p>
      
      <h3>6. Rasa</h3>
      <p>Madu asli memiliki rasa manis yang natural dan meninggalkan sedikit sensasi di tenggorokan. Madu palsu biasanya hanya manis seperti gula tanpa aftertaste.</p>
      
      <h3>7. Proses Kristalisasi</h3>
      <p>Madu asli akan mengkristal secara alami seiring waktu, terutama jika disimpan di suhu dingin. Ini adalah tanda alami madu murni. Madu palsu jarang mengkristal atau tetap cair.</p>
      
      <h3>8. Perhatikan Label dan Sertifikasi</h3>
      <p>Pastikan produk memiliki label yang jelas dengan informasi produsen, tanggal kadaluarsa, dan idealnya memiliki sertifikasi dari laboratorium atau badan terkait.</p>
      
      <h3>9. Harga</h3>
      <p>Waspada dengan harga yang terlalu murah. Madu asli memerlukan proses produksi yang tidak mudah dan sumber nektar berkualitas, sehingga harganya tidak akan terlalu murah.</p>
      
      <h3>10. Beli dari Sumber Terpercaya</h3>
      <p>Cara terbaik adalah membeli dari produsen atau brand terpercaya yang memiliki reputasi baik dan transparansi dalam proses produksi, seperti Zari Honey.</p>
      
      <p><strong>Kesimpulan:</strong> Dengan mengetahui cara-cara di atas, Anda dapat lebih mudah membedakan madu asli dan palsu. Selalu pilih madu yang telah tersertifikasi dan dari sumber terpercaya untuk mendapatkan manfaat kesehatan yang maksimal.</p>
    `,
    tags: ["tips", "madu asli", "edukasi"],
  },
  {
    id: 3,
    slug: "resep-minuman-sehat-dengan-madu",
    title: "5 Resep Minuman Sehat dengan Madu untuk Meningkatkan Imunitas",
    excerpt:
      "Kreasi minuman sehat berbahan dasar madu yang mudah dibuat di rumah untuk menjaga kesehatan keluarga.",
    image: "/images/articles/resep-madu.jpg",
    category: "Resep",
    author: "Chef Healthy",
    date: "5 Desember 2025",
    readTime: "6 min",
    content: `
      <h2>Minuman Sehat untuk Keluarga</h2>
      <p>Madu bisa diolah menjadi berbagai minuman sehat yang nikmat dan mudah dibuat di rumah. Berikut 5 resep minuman berbahan dasar madu yang dapat meningkatkan imunitas keluarga Anda.</p>
      
      <h3>1. Lemon Honey Tea</h3>
      <p><strong>Bahan:</strong></p>
      <ul>
        <li>2 sdm madu murni</li>
        <li>1 buah lemon, peras airnya</li>
        <li>200ml air hangat</li>
        <li>Jahe segar secukupnya (opsional)</li>
      </ul>
      <p><strong>Cara membuat:</strong> Campurkan air lemon dan madu dalam air hangat. Tambahkan jahe jika suka. Aduk rata dan minum selagi hangat. Minuman ini sangat baik untuk meningkatkan imunitas dan meredakan flu.</p>
      
      <h3>2. Turmeric Honey Milk</h3>
      <p><strong>Bahan:</strong></p>
      <ul>
        <li>1 gelas susu (bisa susu almond atau oat milk)</li>
        <li>1 sdm madu</li>
        <li>1/2 sdt bubuk kunyit</li>
        <li>Sejumput lada hitam</li>
        <li>Sejumput kayu manis</li>
      </ul>
      <p><strong>Cara membuat:</strong> Hangatkan susu, tambahkan kunyit, lada hitam, dan kayu manis. Setelah hangat, tambahkan madu dan aduk rata. Golden milk ini sangat baik untuk anti-inflamasi dan meningkatkan kualitas tidur.</p>
      
      <h3>3. Honey Ginger Immunity Booster</h3>
      <p><strong>Bahan:</strong></p>
      <ul>
        <li>2 sdm madu</li>
        <li>Jahe segar 3cm, parut</li>
        <li>1 siung bawang putih, cincang halus</li>
        <li>Air jeruk nipis</li>
        <li>Air hangat 250ml</li>
      </ul>
      <p><strong>Cara membuat:</strong> Seduh jahe dan bawang putih dengan air hangat. Diamkan 5 menit, saring. Tambahkan madu dan air jeruk nipis. Ramuan ampuh untuk meningkatkan daya tahan tubuh.</p>
      
      <h3>4. Green Tea Honey Detox</h3>
      <p><strong>Bahan:</strong></p>
      <ul>
        <li>1 kantong green tea atau 1 sdt daun teh hijau</li>
        <li>1 sdm madu</li>
        <li>Daun mint segar</li>
        <li>Air panas 200ml</li>
      </ul>
      <p><strong>Cara membuat:</strong> Seduh green tea dengan air panas, diamkan 3-5 menit. Tambahkan madu dan daun mint. Minuman ini kaya antioksidan dan membantu detoksifikasi tubuh.</p>
      
      <h3>5. Apple Cider Vinegar Honey Tonic</h3>
      <p><strong>Bahan:</strong></p>
      <ul>
        <li>1 sdm apple cider vinegar</li>
        <li>1 sdm madu</li>
        <li>200ml air hangat</li>
        <li>Sejumput kayu manis</li>
      </ul>
      <p><strong>Cara membuat:</strong> Campurkan semua bahan dalam air hangat, aduk rata. Minum di pagi hari sebelum sarapan. Baik untuk pencernaan dan metabolisme.</p>
      
      <h3>Tips Penting:</h3>
      <ul>
        <li>Gunakan madu murni berkualitas tinggi untuk hasil terbaik</li>
        <li>Jangan tambahkan madu ke air yang terlalu panas (di atas 60°C) karena dapat merusak enzim alami</li>
        <li>Konsumsi rutin untuk hasil optimal</li>
        <li>Sesuaikan takaran madu dengan selera manis Anda</li>
      </ul>
      
      <p><strong>Kesimpulan:</strong> Kelima resep minuman sehat ini mudah dibuat dan memberikan manfaat luar biasa untuk kesehatan keluarga. Pastikan menggunakan madu murni seperti produk Zari Honey untuk mendapatkan khasiat maksimal.</p>
    `,
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
    content: `
      <h2>Dari Hutan ke Meja Anda</h2>
      <p>Setiap botol madu Zari Honey melalui proses yang ketat dan penuh perhatian untuk memastikan kualitas premium sampai ke tangan Anda. Mari kita telusuri perjalanan madu dari sarang lebah hingga botol premium di rumah Anda.</p>
      
      <h3>1. Pemilihan Lokasi Panen</h3>
      <p>Kami bekerja sama dengan peternak lebah lokal terpilih di berbagai wilayah Indonesia. Lokasi dipilih berdasarkan kualitas flora, jauh dari polusi, dan memiliki sumber nektar yang berlimpah. Setiap lokasi disurvei secara berkala untuk memastikan kondisi optimal.</p>
      
      <h3>2. Perawatan Koloni Lebah</h3>
      <p>Kesehatan lebah adalah prioritas utama kami. Peternak mitra kami memastikan koloni lebah mendapatkan habitat yang sehat, tanpa penggunaan pestisida atau bahan kimia berbahaya. Lebah dibiarkan mencari nektar secara natural dari bunga-bunga liar.</p>
      
      <h3>3. Waktu Panen yang Tepat</h3>
      <p>Madu dipanen hanya ketika sudah matang sempurna di dalam sarang. Kami tidak terburu-buru dalam proses panen untuk memastikan madu memiliki kandungan air yang rendah dan kualitas nutrisi yang optimal. Proses ini biasanya memakan waktu beberapa minggu.</p>
      
      <h3>4. Proses Ekstraksi Manual</h3>
      <p>Madu diekstraksi dari sarang menggunakan metode sentrifugal yang lembut untuk menjaga struktur enzim dan nutrisi alami. Kami tidak menggunakan pemanasan tinggi yang dapat merusak kualitas madu.</p>
      
      <h3>5. Penyaringan Bertahap</h3>
      <p>Madu disaring secara bertahap untuk menghilangkan kotoran dan partikel besar, namun tetap mempertahankan serbuk sari dan propolis yang bermanfaat. Proses penyaringan dilakukan dengan sangat hati-hati untuk menjaga keaslian madu.</p>
      
      <h3>6. Uji Laboratorium</h3>
      <p>Setiap batch madu melalui pengujian laboratorium yang ketat. Kami menguji kandungan nutrisi, kemurnian, kadar air, dan memastikan tidak ada kandungan antibiotik atau bahan tambahan. Hanya madu yang lolos uji yang akan dikemas.</p>
      
      <h3>7. Pengemasan Higienis</h3>
      <p>Madu dikemas dalam botol kaca food-grade di fasilitas yang steril. Setiap botol disegel dengan rapat untuk menjaga kesegaran dan mencegah kontaminasi. Kami tidak menambahkan pengawet atau bahan kimia apapun.</p>
      
      <h3>8. Pelabelan Transparan</h3>
      <p>Setiap botol diberi label dengan informasi lengkap: asal nektar, lokasi panen, tanggal produksi, dan batch number untuk traceability. Kami percaya pada transparansi penuh kepada konsumen.</p>
      
      <h3>9. Quality Control Akhir</h3>
      <p>Sebelum distribusi, tim QC kami melakukan pemeriksaan akhir pada setiap botol: kualitas seal, label, dan tampilan produk. Hanya produk yang sempurna yang akan dikirim ke konsumen.</p>
      
      <h3>10. Distribusi dan Penyimpanan</h3>
      <p>Madu disimpan di gudang dengan suhu dan kelembaban terkontrol. Proses pengiriman dilakukan dengan cepat dan aman untuk memastikan produk sampai dalam kondisi prima.</p>
      
      <h3>Komitmen Kami</h3>
      <p>Zari Honey berkomitmen untuk:</p>
      <ul>
        <li>100% madu murni tanpa campuran</li>
        <li>Tidak menggunakan pemanasan tinggi</li>
        <li>Tidak menambahkan gula atau pemanis buatan</li>
        <li>Mendukung peternak lokal</li>
        <li>Ramah lingkungan dan berkelanjutan</li>
      </ul>
      
      <p><strong>Kesimpulan:</strong> Proses panjang dan penuh dedikasi inilah yang membuat madu Zari Honey berbeda. Kami tidak mengambil jalan pintas karena kualitas dan kepuasan Anda adalah prioritas utama kami. Setiap tetes madu adalah hasil dari kerja keras dan komitmen kami terhadap kualitas premium.</p>
    `,
    tags: ["produksi", "kualitas", "behind the scene"],
  },
];

export const CTA_SECTION = {
  heading: "Rasakan Kemurnian Madu Premium Hari Ini",
  body: "Bergabunglah dengan ribuan keluarga Indonesia yang telah merasakan manfaat madu murni Zari Honey. Pesan sekarang atau jadilah mitra reseller kami.",
};

export const FOOTER_CONTENT = {
  tagline: "Zari Honey - Kemurnian Alam, Kualitas Premium",
  copyright: `© ${new Date().getFullYear()} Zari Honey. All rights reserved.`,
};

export const SEO_CONTENT = {
  title: "Zari Honey - Madu Premium Asli Indonesia | 100% Murni & Natural",
  description:
    "Madu premium berkualitas tinggi dari alam Indonesia. 100% murni, single-origin, tersertifikasi lab. Pesan sekarang atau bergabung menjadi reseller premium.",
  ogImage: "/og-image.jpg",
};
