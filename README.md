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

## Supabase Image Management

### Overview

This application automatically fetches and displays images from Supabase Storage. Images are categorized and matched to components using intelligent fuzzy matching.

### How Image Fetching Works

The application uses the `useSupabaseImages` hook (located in `src/hooks/useSupabaseImages.ts`) to:

1. **Fetch all images** from the Supabase Storage bucket (default: `images`)
2. **Filter out videos** - Only image formats are used (jpg, jpeg, png, webp, svg, gif)
3. **Categorize images** using fuzzy matching:
   - **Hero images**: Files containing "hero" in the filename
   - **Fire Stick products**: Files containing "firestick" or "fire stick" (handles variations)
   - **IPTV subscriptions**: Files containing both "iptv" and "subscription"
   - **Sports images**: Files containing sports keywords:
     - Football: "nfl" or "football"
     - Baseball: "mlb" or "baseball"
     - Basketball: "nba" or "basketball"
     - UFC/Boxing: "ufc", "mma", or "boxing"

### Fuzzy Matching

The fuzzy matching algorithm handles common variations:
- Case insensitive
- Ignores spaces, hyphens, and underscores
- Examples:
  - "Fire Stick" matches "firestick", "fire-stick", "FireStick", etc.
  - "IPTV subscription" matches "iptv-subscription", "IPTVSubscription", etc.

### Component Integration

**Hero Component** (`src/components/Hero.tsx`)
- Automatically fetches and displays the hero background image
- Falls back to placeholder if no hero image is found

**MediaCarousel Component** (`src/components/MediaCarousel.tsx`)
- Dynamically loads sports images from Supabase
- Uses best-match algorithm for each sport category
- Falls back to placeholder images if sports images aren't available

**Shop Component** (`src/components/Shop.tsx`)
- Matches Fire Stick product images using fuzzy matching (HD, 4K, 4K Max)
- Matches IPTV subscription images
- Falls back to placeholder images if products don't have images

### Placeholder Fallbacks

If images are missing from Supabase Storage, the application uses:
- High-quality Pexels placeholder images
- Ensures the site never shows broken images
- Components handle missing images gracefully

### Configuration

Set your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STORAGE_BUCKET_NAME=images
```

### Uploading Images

To add images to Supabase Storage:

1. Go to your Supabase Dashboard → Storage → `images` bucket
2. Upload images with descriptive filenames:
   - Hero: `hero-background.jpg`, `hero-image.png`, etc.
   - Fire Sticks: `firestick-hd.jpg`, `firestick-4k.jpg`, `firestick-4k-max.jpg`
   - IPTV: `iptv-subscription.jpg`
   - Sports: `nfl-football.jpg`, `mlb-baseball.jpg`, `nba-basketball.jpg`, `ufc-boxing.jpg`
3. Images are automatically detected and categorized by the application

### Video Exclusion

Video files (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.flv`) are automatically excluded from image fetching. Only standard image formats are used for display.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/db47acea-a5a1-486e-a7be-658390194b66) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
