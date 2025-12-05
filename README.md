# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/db47acea-a5a1-486e-a7be-658390194b66

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/db47acea-a5a1-486e-a7be-658390194b66) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Product Image Management System

### Overview

This application features a comprehensive **Product Image Management System** with intelligent fallback logic and admin panel integration for seamless image uploads and management.

### Image Fallback System

All product images follow a **priority-based fallback logic** to ensure reliable display:

1. **Local `/public/images/` assets** - First priority (if present)
2. **Supabase Storage public URL** - Second priority (if image missing locally)
3. **Category-based placeholder** - Third priority (firestick, iptv, etc.)
4. **Generic placeholder** - Final fallback (`/placeholder.svg`)

This ensures **zero broken images** on your site, regardless of hosting or storage configuration.

### Admin Panel Image Upload

The admin panel provides a powerful image management interface:

#### Features:
- **Drag-and-drop upload** - Simply drag images onto the upload area
- **File picker support** - Click to browse and select images
- **Batch uploads** - Upload multiple images at once
- **Gallery preview** - See all uploaded images with thumbnails
- **Primary image selection** - Set which image displays first
- **Delete images** - Remove unwanted images instantly
- **Instant updates** - Changes reflect immediately on the frontend
- **Visual feedback** - Real-time upload progress and status

#### Using the Admin Panel:

1. **Navigate to Admin Dashboard**
   - Login to admin panel at `/admin` or `/unified-admin-login`
   - Go to "Products" section

2. **Add/Edit Product**
   - Click "Add Product" or edit existing product
   - Scroll to the "Product Image" section

3. **Upload Images**
   - **Drag & Drop**: Drag image files directly onto the upload area
   - **File Picker**: Click the upload area to browse your device
   - **Multiple files**: Select multiple images for batch upload
   - Wait for upload confirmation

4. **Manage Images**
   - **Set Primary**: Click the star icon to set the main product image
   - **Delete**: Click the X button to remove an image
   - All changes are instant and automatically saved

#### Image Storage:

- **Supabase Storage**: All uploads are stored in Supabase Storage bucket (`images`)
- **Local files**: For manual local image management, place files in `/public/images/`
  - Example: `/public/images/firestick-4k.jpg`
  - These take priority over Supabase URLs

### Frontend Image Display

The application uses the `ProductImage` component which automatically:

1. **Attempts local image** - Tries to load from `/public/images/` first
2. **Falls back to Supabase** - If local fails, tries Supabase Storage URL
3. **Uses category placeholder** - If both fail, shows category-appropriate placeholder
4. **Shows generic placeholder** - Final fallback for unknown categories
5. **Displays loading state** - Shows skeleton while image loads
6. **Handles errors gracefully** - No broken image icons

### Configuration

Set your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STORAGE_BUCKET_NAME=images
```

### Manual Image Upload (Advanced)

#### Option 1: Via Supabase Dashboard
1. Go to Supabase Dashboard → Storage → `images` bucket
2. Navigate to `products/` folder
3. Upload images with descriptive filenames
4. Images are instantly available to your products

#### Option 2: Via Admin Panel (Recommended)
- Use the built-in admin panel image uploader
- Supports drag-and-drop and batch uploads
- Automatically manages file naming and organization

#### Option 3: Local Files (Development)
1. Place images in `/public/images/` directory
2. Use filenames like:
   - `firestick-4k.jpg` - Fire Stick 4K
   - `firestick-hd.jpg` - Fire Stick HD
   - `iptv-subscription.jpg` - IPTV products
3. These files take priority over Supabase URLs
4. Note: On hosted platforms, local file writes may not be possible

### Supported Image Formats

- JPG/JPEG
- PNG
- WEBP
- GIF
- SVG

Video files (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.flv`) are automatically excluded from image operations.

### Image Naming Best Practices

For automatic categorization, use descriptive filenames:
- Fire Stick products: Include "firestick" or "fire-stick"
- IPTV products: Include "iptv" and "subscription"
- General products: Use product name or SKU

### Troubleshooting

**Images not displaying?**
1. Check Supabase Storage bucket has public access
2. Verify image URLs are correct in product records
3. Check browser console for loading errors
4. Ensure image files are under 5MB (Supabase free tier limit)

**Upload failing?**
1. Check Supabase credentials in `.env`
2. Verify Storage bucket exists and is named `images`
3. Check file size (keep under 5MB)
4. Ensure valid image format (JPG, PNG, WEBP, GIF)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/db47acea-a5a1-486e-a7be-658390194b66) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
