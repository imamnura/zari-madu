# 🚀 Hosting Recommendation - Zari Madu Website

## ❌ **Shared Hosting TIDAK COCOK!**

### Kenapa Shared Hosting (cPanel) Tidak Bisa?

Website Zari Madu adalah **Next.js Fullstack Application** yang butuh:

1. ❌ **Node.js Runtime** (v18+)
   - Shared hosting biasanya hanya support PHP
2. ❌ **Persistent Process**
   - Next.js butuh server yang always-on
   - Shared hosting restart setiap request
3. ❌ **Server-Side Rendering (SSR)**
   - Next.js generate HTML di server
   - Bukan static HTML seperti WordPress
4. ❌ **API Routes**
   - Ada 20+ API endpoints
   - Butuh Node.js backend
5. ❌ **Database Connection Pooling**

   - MySQL dengan Prisma ORM
   - Butuh persistent connections

6. ❌ **Modern Node.js Features**
   - ES Modules, async/await
   - Build system (Webpack/Turbopack)

**Kesimpulan: Harus pakai VPS atau Platform-as-a-Service!**

---

## ✅ **Rekomendasi Hosting (3 Pilihan)**

### **Option 1: VPS (Recommended untuk Full Control)** ⭐

#### **A. Hostinger VPS (Budget-Friendly)**

**Paket: VPS 2 atau VPS 3**

| Spec       | VPS 2             | VPS 3             |
| ---------- | ----------------- | ----------------- |
| CPU        | 2 vCPU            | 4 vCPU            |
| RAM        | 4 GB              | 8 GB              |
| Storage    | 100 GB SSD        | 200 GB SSD        |
| Bandwidth  | 4 TB              | 8 TB              |
| Harga      | ~Rp 150.000/bulan | ~Rp 300.000/bulan |
| **Status** | ✅ Cukup          | ⭐ Ideal          |

**Mengapa VPS 3 Lebih Baik:**

- 8 GB RAM untuk handle traffic tinggi
- 4 vCPU untuk build & server rendering cepat
- 200 GB cukup untuk growth 2-3 tahun
- Bisa install Docker untuk deployment mudah

**Link:** https://www.hostinger.co.id/vps-hosting

---

#### **B. Niagahoster VPS Cloud**

**Paket: VPS NEO 2 atau VPS NEO 3**

| Spec       | NEO 2             | NEO 3             |
| ---------- | ----------------- | ----------------- |
| CPU        | 2 vCPU            | 4 vCPU            |
| RAM        | 4 GB              | 8 GB              |
| Storage    | 60 GB SSD         | 80 GB SSD         |
| Bandwidth  | Unlimited         | Unlimited         |
| Harga      | ~Rp 200.000/bulan | ~Rp 400.000/bulan |
| **Status** | ✅ Cukup          | ⭐ Ideal          |

**Kelebihan:**

- Support Indonesia (Bahasa)
- Datacenter Jakarta (latency rendah)
- Unlimited bandwidth
- Managed panel (Plesk optional)

**Link:** https://www.niagahoster.co.id/vps-murah

---

#### **C. DigitalOcean Droplets (International)** 🌍

**Paket: Basic Droplet**

| Spec       | Basic                | Regular              |
| ---------- | -------------------- | -------------------- |
| CPU        | 2 vCPU               | 4 vCPU               |
| RAM        | 4 GB                 | 8 GB                 |
| Storage    | 80 GB SSD            | 160 GB SSD           |
| Bandwidth  | 4 TB                 | 5 TB                 |
| Harga      | $24/bulan (~Rp 380k) | $48/bulan (~Rp 760k) |
| **Status** | ✅ Cukup             | ⭐ Ideal             |

**Kelebihan:**

- Global infrastructure
- Singapore datacenter (dekat Indonesia)
- 1-click Node.js app install
- Excellent documentation
- Free $200 credit untuk new users

**Link:** https://www.digitalocean.com/

---

### **Option 2: Platform-as-a-Service (Easiest)** 🚀

#### **A. Vercel (Recommended untuk Next.js)** ⭐⭐⭐

**Paket: Pro Plan**

| Spec                | Hobby (Free)    | Pro                  |
| ------------------- | --------------- | -------------------- |
| Bandwidth           | 100 GB          | 1 TB                 |
| Build Minutes       | 6,000 min/month | 24,000 min/month     |
| Serverless Function | 100 GB-Hrs      | 1,000 GB-Hrs         |
| Team Members        | 1               | Unlimited            |
| **Harga**           | FREE            | $20/month (~Rp 320k) |
| **Status**          | ⚠️ Terbatas     | ⭐ Production-Ready  |

**Kelebihan:**

- ✅ Dibuat khusus untuk Next.js
- ✅ Zero-config deployment
- ✅ Automatic HTTPS & CDN global
- ✅ Git-based deployment (push = deploy)
- ✅ Preview deployments
- ✅ Edge Functions (super fast)
- ✅ Built-in analytics
- ✅ Automatic scaling

**Kekurangan:**

- ⚠️ Butuh database external (Railway, PlanetScale)
- ⚠️ Hobby plan terbatas untuk traffic tinggi

**Link:** https://vercel.com/

---

#### **B. Railway (All-in-One)** 🚂

**Paket: Pro Plan**

| Resource   | Hobby (Free)    | Pro               |
| ---------- | --------------- | ----------------- |
| RAM        | 512 MB          | 8 GB per service  |
| CPU        | Shared          | Dedicated         |
| Database   | ✅ Included     | ✅ Included       |
| Bandwidth  | 100 GB          | Unlimited         |
| **Harga**  | $5/month usage  | $20/month + usage |
| **Status** | ⚠️ Very Limited | ⭐ Full-Featured  |

**Kelebihan:**

- ✅ Database included (MySQL/PostgreSQL)
- ✅ Git-based deployment
- ✅ Environment variables management
- ✅ Built-in monitoring
- ✅ Easy setup

**Kekurangan:**

- ⚠️ Lebih mahal untuk high traffic
- ⚠️ US/EU datacenter (latency ke Indonesia)

**Link:** https://railway.app/

---

#### **C. Render (Alternative)** 🎨

**Paket: Starter atau Standard**

| Service    | Starter    | Standard  |
| ---------- | ---------- | --------- |
| RAM        | 512 MB     | 2 GB      |
| CPU        | Shared     | Shared    |
| Database   | Separate   | Separate  |
| **Harga**  | $7/month   | $25/month |
| **Status** | ⚠️ Limited | ✅ Good   |

**Kelebihan:**

- ✅ Simple pricing
- ✅ Automatic SSL
- ✅ Background workers
- ✅ Cron jobs

**Link:** https://render.com/

---

### **Option 3: Cloud Platforms (Enterprise)** ☁️

#### **AWS / Google Cloud / Azure**

**Hanya jika:**

- Traffic > 50,000 visitors/month
- Budget > $100/month
- Butuh advanced features

**Tidak recommended untuk UMKM** - terlalu kompleks & mahal.

---

## 📊 **Spesifikasi Minimum & Rekomendasi**

### **Untuk Zari Madu Website:**

| Resource      | Minimum      | Recommended | Ideal       |
| ------------- | ------------ | ----------- | ----------- |
| **CPU**       | 2 vCPU       | 4 vCPU      | 4+ vCPU     |
| **RAM**       | 2 GB         | 4 GB        | 8 GB        |
| **Storage**   | 40 GB SSD    | 80 GB SSD   | 100+ GB SSD |
| **Bandwidth** | 500 GB/month | 2 TB/month  | 4+ TB/month |
| **Node.js**   | v18+         | v20+        | v22+        |
| **Database**  | MySQL 8+     | MySQL 8+    | MySQL 8+    |

### **Breakdown Storage:**

```
node_modules:     669 MB  (not deployed)
.next (build):    129 MB  (production build)
Database:         < 1 GB  (content)
Cloudinary:       External (images)
Logs:             2-5 GB
OS + Software:    5-10 GB
Buffer/Growth:    20-50 GB
------------------------
Total Need:       40-80 GB
```

### **Breakdown RAM:**

```
Next.js Server:   512 MB - 1 GB
MySQL:            512 MB - 1 GB
Prisma:           256 MB
Node.js Runtime:  256 MB
OS (Linux):       512 MB
Buffer:           1-2 GB
------------------------
Total Need:       2-4 GB minimum
Recommended:      4-8 GB for smooth operation
```

### **Traffic Estimate:**

Untuk 10,000 visitors/day:

- Bandwidth: ~2 TB/month
- RAM peak: 4 GB
- CPU: 2-4 vCPU

---

## 🎯 **Rekomendasi Final (Per Budget)**

### **Budget < Rp 200k/month:**

1. **Vercel Hobby (FREE)** + PlanetScale (FREE database)
   - Best untuk testing & MVP
   - Limitations: 100 GB bandwidth/month

### **Budget Rp 200-400k/month:**

1. ⭐ **Hostinger VPS 2** (Rp 150k) + cPanel (Rp 50k)
   - 2 vCPU, 4 GB RAM, 100 GB SSD
   - Self-managed
2. ⭐ **Vercel Pro** ($20/month)
   - Easy setup
   - Need external database

### **Budget Rp 400-600k/month (RECOMMENDED):** ⭐⭐⭐

1. **Hostinger VPS 3** (Rp 300k/month)
   - 4 vCPU, 8 GB RAM, 200 GB SSD
   - Ideal untuk growth
   - Install Docker + Nginx + MySQL
2. **DigitalOcean Droplet + Managed Database**
   - Droplet $24 + Database $15 = $39/month
   - Professional setup
   - Singapore datacenter

### **Budget > Rp 600k/month:**

1. **Railway Pro** atau **Render Standard**
   - All-in-one platform
   - Zero DevOps knowledge needed
   - Auto-scaling

---

## 🛠️ **Setup Guide per Hosting Type**

### **A. VPS Setup (Hostinger/DigitalOcean)**

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (process manager)
npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone/upload project
cd /var/www
git clone your-repo.git zari-madu
cd zari-madu

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
nano .env  # Edit credentials

# Database setup
pnpm prisma migrate deploy
pnpm prisma db seed

# Build
pnpm build

# Start with PM2
pm2 start "pnpm start" --name zari-madu
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/zarihoney.com
server {
    listen 80;
    server_name zarihoney.com www.zarihoney.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/zarihoney.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (free)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d zarihoney.com -d www.zarihoney.com
```

---

### **B. Vercel Setup (Easiest)**

#### 1. Create vercel.json

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

#### 2. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables via dashboard
# https://vercel.com/dashboard/project/settings/environment-variables
```

#### 3. Database Setup

**Option 1: PlanetScale (Recommended)**

```bash
# Create free database at planetscale.com
# Copy connection string
# Add to Vercel environment variables
```

**Option 2: Railway Database**

```bash
# Create MySQL database at railway.app
# Copy connection string
# Add to Vercel environment variables
```

---

### **C. Railway Setup (All-in-One)**

#### 1. Connect GitHub

- Link your GitHub repository
- Railway auto-detects Next.js

#### 2. Add MySQL Service

- Click "New" → "Database" → "MySQL"
- Railway provides connection string

#### 3. Configure Environment Variables

- Add all .env variables
- Set DATABASE_URL from MySQL service

#### 4. Deploy

- Push to GitHub = Auto deploy
- Railway builds and deploys automatically

---

## 💰 **Cost Comparison (Monthly)**

| Hosting                | Cost           | Setup | Maintenance | Total       |
| ---------------------- | -------------- | ----- | ----------- | ----------- |
| **Hostinger VPS 2**    | Rp 150k        | DIY   | DIY         | Rp 150k     |
| **Hostinger VPS 3** ⭐ | Rp 300k        | DIY   | DIY         | Rp 300k     |
| **DigitalOcean**       | $24 (~Rp 380k) | DIY   | DIY         | Rp 380k     |
| **Vercel Pro**         | $20 (~Rp 320k) | Easy  | Zero        | Rp 320k     |
| **Railway Pro**        | $20-40         | Easy  | Zero        | Rp 320-640k |
| **Niagahoster VPS**    | Rp 200k        | DIY   | DIY         | Rp 200k     |

**Additional Costs:**

- Domain: Rp 150k/year (~Rp 12.5k/month)
- Cloudinary: FREE (25 GB)
- SSL: FREE (Let's Encrypt)

---

## 🎯 **My Recommendation for Zari Madu**

### **For Production Launch:** ⭐⭐⭐

**Hostinger VPS 3** (Rp 300k/month)

- **CPU:** 4 vCPU
- **RAM:** 8 GB
- **Storage:** 200 GB SSD
- **Bandwidth:** 8 TB

**Why:**

1. ✅ **Affordable** - Under $20/month
2. ✅ **Powerful** - Handle 50k+ visitors/day
3. ✅ **Scalable** - Can upgrade easily
4. ✅ **Full Control** - Install anything
5. ✅ **Indonesia Support** - Bahasa Indonesia
6. ✅ **Fast Setup** - Pre-configured templates
7. ✅ **Growth Ready** - 2-3 years tanpa upgrade

**Total Monthly Cost:**

- VPS: Rp 300k
- Domain: Rp 12.5k (yearly/12)
- Cloudinary: FREE
- Total: **~Rp 312k/month** ✅

---

### **For Quick Launch (No DevOps):** 🚀

**Vercel Pro** ($20/month) + **PlanetScale Free**

- **Price:** Rp 320k/month
- **Setup:** 10 minutes
- **Maintenance:** Zero
- **Scaling:** Automatic

**Why:**

1. ✅ **Zero Config** - Just push to Git
2. ✅ **Auto HTTPS** - SSL included
3. ✅ **Global CDN** - Super fast worldwide
4. ✅ **Zero Downtime** - Automatic failover
5. ✅ **Preview URLs** - Test before deploy
6. ✅ **Analytics** - Built-in monitoring

**Total Monthly Cost:**

- Vercel: Rp 320k
- Database: FREE (PlanetScale)
- Domain: Rp 12.5k
- Total: **~Rp 332k/month** ✅

---

## 🚀 **Action Plan**

### **Option A: VPS Route (More Control)**

**Week 1:**

1. ✅ Order Hostinger VPS 3
2. ✅ Setup Ubuntu 22.04
3. ✅ Install Node.js, MySQL, Nginx
4. ✅ Deploy application

**Week 2:**

1. ✅ Configure SSL
2. ✅ Setup monitoring (PM2)
3. ✅ Configure backups
4. ✅ Performance tuning

### **Option B: Vercel Route (Fastest)**

**Day 1:**

1. ✅ Create Vercel account
2. ✅ Create PlanetScale database
3. ✅ Connect GitHub repo
4. ✅ Set environment variables
5. ✅ Deploy!

**Day 2:**

1. ✅ Add custom domain
2. ✅ Configure DNS
3. ✅ Test everything
4. ✅ Go live!

---

## 📊 **Performance Expectations**

### **Hostinger VPS 3:**

- Page Load: < 2 seconds
- API Response: < 100ms
- Concurrent Users: 500+
- Daily Visitors: 50,000+
- Uptime: 99.5%+

### **Vercel Pro:**

- Page Load: < 1 second
- API Response: < 50ms
- Concurrent Users: 1,000+
- Daily Visitors: 100,000+
- Uptime: 99.99%

---

## ✅ **Final Answer**

### **Shared Hosting = NO ❌**

### **Best Choice for Zari Madu:**

**Budget-Conscious:** Hostinger VPS 3 (Rp 300k/month) ⭐
**Time-Conscious:** Vercel Pro (Rp 320k/month) ⭐⭐⭐

Both options akan handle website dengan baik untuk traffic 10k-50k visitors/day!

---

**Need help with setup?** Bisa follow guide di atas atau saya bisa bantu setup step-by-step! 🚀
