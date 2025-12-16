# Settings Management Enhancement - Implementation Guide

## Overview

Enhanced the dashboard settings to include comprehensive contact information management, replacing static constants with dynamic database-driven settings. All contact information (WhatsApp, Instagram, Email, Shopee, Maps) is now editable through the admin dashboard and automatically reflected across the entire website.

## Changes Made

### 1. Database Schema

**File**: `/prisma/schema.prisma`

Added new `Settings` model:

```prisma
model Settings {
  id           String   @id @default(cuid())
  whatsapp     String   @default("+6285777578827")
  instagram    String   @default("https://www.instagram.com/zarihoney")
  email        String   @default("info@zarilife.com")
  shopeeLink   String   @default("https://id.shp.ee/GgH8AKs")
  mapsLocation String   @default("https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8")
  mapsEmbed    String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("settings")
}
```

**Manual Migration Required**:

```sql
USE zari_madu;
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  whatsapp VARCHAR(191) NOT NULL DEFAULT '+6285777578827',
  instagram VARCHAR(191) NOT NULL DEFAULT 'https://www.instagram.com/zarihoney',
  email VARCHAR(191) NOT NULL DEFAULT 'info@zarilife.com',
  shopeeLink VARCHAR(191) NOT NULL DEFAULT 'https://id.shp.ee/GgH8AKs',
  mapsLocation VARCHAR(191) NOT NULL DEFAULT 'https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8',
  mapsEmbed TEXT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. API Endpoints

**File**: `/app/api/admin/settings/route.ts`

Created new API endpoints:

- **GET** `/api/admin/settings` - Fetch current settings (public)
- **PUT** `/api/admin/settings` - Update settings (requires authentication)

Features:

- Zod validation for all fields
- Automatic creation of default settings if none exist
- Authentication check for updates
- Proper error handling

### 3. Dashboard Settings Page

**File**: `/app/admin/dashboard/settings/page.tsx`

Enhanced with two sections:

#### A. Contact Information Settings

- WhatsApp number input
- Instagram URL input
- Email address input
- Shopee store link input
- Google Maps location link input
- Google Maps embed code textarea

All fields include:

- Icon indicators
- Validation messages
- Helpful placeholder text
- Helper text explaining usage

#### B. Password Management

- Existing password change functionality
- Separated into its own card for better UX

### 4. Frontend Components Updated

#### [components/Footer.tsx](components/Footer.tsx)

- Now fetches settings from API on mount
- Falls back to `CONTACT_INFO` constants if API fails
- Dynamically displays:
  - WhatsApp number with clickable link
  - Instagram URL
  - Email with mailto link
  - Google Maps embed

#### [components/Header.tsx](components/Header.tsx)

- **Logo is now clickable** - scrolls to top/home
- Changed from `<a href="#">` to `<button onClick={scrollToTop}>`
- Smooth scroll animation

#### [components/HeroSection.tsx](components/HeroSection.tsx)

- Fetches settings on component mount
- Uses dynamic WhatsApp number for CTA buttons
- Uses dynamic Shopee link for "Pesan Sekarang" button

#### [components/CTASection.tsx](components/CTASection.tsx)

- Fetches settings on component mount
- All CTA buttons use dynamic contact information
- Shopee button uses `shopeeLink` from settings

### 5. Database Seeding

**File**: `/prisma/seed.ts`

Added default settings seeding:

```typescript
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
    mapsEmbed: "...",
  },
});
```

## Usage Guide

### Admin Dashboard

1. **Navigate to Settings**:

   - Go to `/admin/dashboard/settings`
   - You'll see two cards: "Informasi Kontak" and "Ubah Password"

2. **Update Contact Information**:

   - Fill in WhatsApp number (format: +628...)
   - Add Instagram profile URL
   - Enter business email
   - Provide Shopee store link
   - Add Google Maps share link
   - Paste Google Maps embed code (from Share → Embed a map)
   - Click "Simpan Pengaturan Kontak"

3. **Change Password**:
   - Enter current password
   - Enter new password (min 6 characters)
   - Confirm new password
   - Click "Simpan Password Baru"

### Getting Google Maps Embed Code

1. Go to Google Maps
2. Search for your location
3. Click "Share"
4. Click "Embed a map"
5. Copy the URL from the iframe src attribute
6. Paste into "Embed Code Google Maps" field

## Technical Details

### Data Flow

```
Admin Dashboard → API (/api/admin/settings) → Database
                                             ↓
                                    Landing Page Components
                                             ↓
                                    Fetch on Mount
                                             ↓
                                    Display Dynamic Data
```

### Fallback Strategy

All components implement graceful degradation:

1. Try to fetch from API
2. If fails, use constants from `/lib/constants.ts`
3. Display default values
4. Log errors to console

### Validation Rules

- **WhatsApp**: Min 10 characters
- **Instagram**: Valid URL format
- **Email**: Valid email format
- **Shopee Link**: Valid URL format
- **Maps Location**: Valid URL format
- **Maps Embed**: Min 10 characters

## Testing Checklist

- [ ] Create settings table in database
- [ ] Run seed script to create default settings
- [ ] Access `/admin/dashboard/settings`
- [ ] Update each field and save
- [ ] Verify changes appear on landing page
- [ ] Test WhatsApp button opens correct number
- [ ] Test Instagram link opens correct profile
- [ ] Test email link creates correct mailto
- [ ] Test Shopee button opens correct store
- [ ] Test Maps embed displays correct location
- [ ] Test logo click scrolls to top
- [ ] Test password change functionality
- [ ] Test validation errors for invalid inputs
- [ ] Test fallback when API is unavailable

## Migration Steps

1. **Stop development server** (if running)

2. **Create settings table**:

   ```bash
   mysql -u root -p zari_madu < /tmp/create_settings.sql
   ```

3. **Run seed script**:

   ```bash
   npm run seed
   # or
   npx prisma db seed
   ```

4. **Verify table creation**:

   ```bash
   mysql -u root -p zari_madu -e "DESCRIBE settings;"
   ```

5. **Start development server**:

   ```bash
   npm run dev
   ```

6. **Test the settings page**:
   - Navigate to `/admin/dashboard/settings`
   - Update settings
   - Check landing page for changes

## Troubleshooting

### "Settings not found" error

- Run the seed script: `npm run seed`
- Check database connection in `.env`
- Verify settings table exists

### Changes not reflecting on landing page

- Clear browser cache
- Check browser console for API errors
- Verify settings are saved in database
- Check Network tab for API calls

### Maps not displaying

- Verify embed code is complete URL (starts with https://)
- Check iframe src format
- Ensure embed code doesn't contain HTML tags

## Future Enhancements

Potential improvements:

- [ ] Add image upload for company logo
- [ ] Add social media links (Facebook, TikTok, etc.)
- [ ] Add business hours settings
- [ ] Add multiple phone numbers support
- [ ] Add SEO meta tags settings
- [ ] Add WhatsApp message templates
- [ ] Add analytics integration settings

## Security Notes

- Settings API is **public for GET** (needed for landing page)
- Settings API is **authenticated for PUT** (admin only)
- Always validate input on both client and server
- Sanitize user input to prevent XSS
- Use HTTPS in production
- Keep database credentials secure

## Performance Considerations

- Settings are fetched once on component mount
- Consider adding caching for production
- Potential optimization: Server-side props for landing page
- Consider CDN for static assets
- Implement loading states for better UX

---

**Implementation Date**: December 16, 2025  
**Developer**: GitHub Copilot  
**Status**: ✅ Complete - Ready for Testing
