# Panduan Deployment Zari Life Landing Page

## 🚀 Deployment ke Vercel (Recommended)

Vercel adalah platform deployment resmi dari Next.js dan yang paling mudah.

### Setup Awal

1. **Buat akun di Vercel**

   - Kunjungi [vercel.com](https://vercel.com)
   - Sign up dengan GitHub/GitLab/Bitbucket

2. **Connect Repository**

   - Push code ke GitHub repository
   - Di Vercel dashboard, klik "Import Project"
   - Pilih repository `zari-madu`

3. **Configure Project**

   - Framework Preset: `Next.js` (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Environment Variables** (optional)

   - Jika menggunakan `.env.local`, tambahkan di Vercel:
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_WHATSAPP`, etc.

5. **Deploy**
   - Klik "Deploy"
   - Tunggu 2-3 menit
   - URL live: `https://zari-madu.vercel.app`

### Custom Domain

1. Di Vercel dashboard → Settings → Domains
2. Add domain: `zarilife.com` atau `www.zarilife.com`
3. Update DNS records di domain registrar:
   - Type: `A` Record
   - Value: `76.76.21.21` (Vercel IP)
   - atau CNAME: `cname.vercel-dns.com`
4. Tunggu propagasi DNS (5-60 menit)

---

## 🌐 Deployment Manual (VPS/Shared Hosting)

### Build Production

```bash
# Build aplikasi
npm run build

# Test production build locally
npm start
```

### Upload ke Server

File yang perlu diupload:

```
.next/           # Build output (WAJIB)
public/          # Static assets
node_modules/    # Dependencies (atau install di server)
package.json
package-lock.json
next.config.js (jika ada)
```

### Setup di VPS (Ubuntu/Debian)

1. **Install Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Upload & Install**

```bash
# Upload via FTP/SCP ke /var/www/zari-madu
cd /var/www/zari-madu
npm install --production
npm run build
```

3. **Setup PM2 (Process Manager)**

```bash
# Install PM2
sudo npm install -g pm2

# Start aplikasi
pm2 start npm --name "zari-madu" -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

4. **Setup Nginx Reverse Proxy**

```nginx
server {
    listen 80;
    server_name zarilife.com www.zarilife.com;

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

5. **Install SSL (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d zarilife.com -d www.zarilife.com
```

---

## 📊 Netlify Deployment

1. Push code ke GitHub
2. Login ke [netlify.com](https://netlify.com)
3. "Add new site" → "Import from Git"
4. Select repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Deploy

---

## 🐳 Docker Deployment (Advanced)

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build & Run:

```bash
docker build -t zari-madu .
docker run -p 3000:3000 zari-madu
```

---

## ✅ Post-Deployment Checklist

- [ ] Test semua CTA WhatsApp (order & reseller)
- [ ] Test responsive di mobile, tablet, desktop
- [ ] Verify semua links (Instagram, Maps, WhatsApp)
- [ ] Test performance (PageSpeed Insights)
- [ ] Setup Google Analytics atau Plausible
- [ ] Test scroll animations berjalan smooth
- [ ] Verify SEO meta tags (view page source)
- [ ] Test di berbagai browser (Chrome, Safari, Firefox)
- [ ] Setup monitoring (Vercel Analytics atau Sentry)

---

## 🔧 Troubleshooting

### Build Error: "Module not found"

```bash
# Hapus cache dan reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Images tidak muncul

- Pastikan gambar ada di `/public/images/`
- Path harus dimulai dengan `/` (contoh: `/images/logo.png`)
- Clear browser cache

### WhatsApp link tidak berfungsi

- Test nomor WhatsApp format: `+6285777578827` (tanpa spasi/karakter lain)
- Test di mobile dan desktop
- Pastikan WhatsApp terinstall di device

---

## 📈 Performance Optimization

### Vercel (Automatic)

- Automatic image optimization
- Edge caching
- Brotli compression
- Zero configuration

### Manual Optimization

1. Compress semua images (< 500KB)
2. Enable Gzip/Brotli di Nginx
3. Setup CDN untuk static assets
4. Enable HTTP/2

---

## 📞 Support

Butuh bantuan deployment?

- WhatsApp: +62 857-7757-8827
- Email: (tambahkan email support jika ada)
