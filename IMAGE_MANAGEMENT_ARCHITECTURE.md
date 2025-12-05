# Product Image Management System Architecture

## Overview

This document describes the comprehensive product image management system implemented for the StreamStick Pro website.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT IMAGE SYSTEM                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ EnhancedProductImageUpload Component                       │ │
│  │                                                              │ │
│  │  • Drag & Drop Upload Zone                                  │ │
│  │  • File Picker (multiple files)                             │ │
│  │  • Real-time Upload Progress                                │ │
│  │  • Batch Upload Support                                     │ │
│  │  • Gallery Preview                                          │ │
│  │  • Primary Image Selection                                  │ │
│  │  • Delete Image Functionality                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                      │
│                  imageManager.ts (Utils)                         │
│                            ↓                                      │
│              ┌─────────────┴──────────────┐                      │
│              ↓                            ↓                       │
│    uploadImageToSupabase()      uploadImageDual()               │
│              ↓                            ↓                       │
│    Supabase Storage              Local + Supabase               │
│      (images bucket)             (dual upload)                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ProductImage Component                                      │ │
│  │                                                              │ │
│  │  Image Fallback Chain (Priority Order):                     │ │
│  │                                                              │ │
│  │  1. Local /public/images/ asset                             │ │
│  │     └─ e.g., /images/firestick-4k.jpg                       │ │
│  │                                                              │ │
│  │  2. Supabase Storage URL                                    │ │
│  │     └─ e.g., https://[project].supabase.co/storage/...      │ │
│  │                                                              │ │
│  │  3. Category-based placeholder                              │ │
│  │     ├─ firestick → /images/firestick-4k.jpg                 │ │
│  │     ├─ iptv → /images/iptv-subscription.jpg                 │ │
│  │     └─ other → /placeholder.svg                             │ │
│  │                                                              │ │
│  │  4. Generic placeholder                                     │ │
│  │     └─ /placeholder.svg (final fallback)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Used in:                                                        │
│  • ProductDetailPage                                             │
│  • ShopPage                                                      │
│  • Product listings                                              │
│  • Checkout pages                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. imageManager.ts (Core Utilities)

**Location:** `src/utils/imageManager.ts`

**Functions:**
- `getProductImage()` - Smart image URL resolver with fallback logic
- `uploadImageToSupabase()` - Single image upload to Supabase Storage
- `uploadImageDual()` - Dual upload (Supabase + local attempt)
- `uploadImagesBatch()` - Batch upload with progress tracking
- `deleteImageFromSupabase()` - Remove image from storage
- `validateImageUrl()` - Check if image URL is accessible
- `getValidatedProductImage()` - Async image validation with fallback

**Key Features:**
- Priority-based fallback system
- Batch processing support
- Progress callbacks
- Error handling
- Category-based defaults

### 2. ProductImage Component

**Location:** `src/components/ProductImage.tsx`

**Props:**
```typescript
{
  productId?: string;
  imagePath?: string;        // Local path
  supabaseUrl?: string;      // Supabase URL
  category?: 'firestick' | 'iptv' | 'website' | 'addon';
  alt?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}
```

**Features:**
- Automatic fallback chain
- Loading skeleton
- Error recovery
- Lazy loading
- Responsive

### 3. EnhancedProductImageUpload Component

**Location:** `src/components/admin/EnhancedProductImageUpload.tsx`

**Props:**
```typescript
{
  productId?: string;
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  allowMultiple?: boolean;
}
```

**Features:**
- Drag & drop interface
- File validation
- Batch upload
- Gallery management
- Primary image selection
- Real-time progress
- Instant delete

### 4. AdminProducts Component (Updated)

**Location:** `src/components/admin/AdminProducts.tsx`

**Integration:**
- Uses `EnhancedProductImageUpload` for all product image management
- Instant updates to product records
- Seamless integration with existing product CRUD operations

## Data Flow

### Upload Flow
```
User Action (Drag/Drop/Select)
    ↓
File Validation
    ↓
Batch Upload to Supabase
    ↓
Progress Tracking
    ↓
Success/Error Handling
    ↓
Update Product Record
    ↓
Gallery Preview Update
    ↓
Frontend Display Refresh
```

### Display Flow
```
Product Request
    ↓
Load Product Data
    ↓
ProductImage Component
    ↓
Try Local Path (/public/images/)
    ↓ (if fails)
Try Supabase URL
    ↓ (if fails)
Try Category Placeholder
    ↓ (if fails)
Show Generic Placeholder
```

## Database Schema

### Products Table (simplified)
```sql
products (
  id uuid PRIMARY KEY,
  name text,
  image_url text,        -- Supabase Storage URL or local path
  type text,             -- 'firestick', 'iptv', etc.
  ...
)

real_products (
  id uuid PRIMARY KEY,
  name text,
  main_image text,       -- Primary image URL
  gallery_images text[], -- Additional images
  category text,
  ...
)
```

## Storage Structure

### Supabase Storage Bucket: `images`
```
images/
├── products/
│   ├── {product-id}-{timestamp}.jpg
│   ├── {product-id}-{timestamp}.png
│   └── ...
└── (other images)
```

### Local Storage: `/public/images/`
```
public/
└── images/
    ├── firestick-4k.jpg
    ├── firestick-hd.jpg
    ├── iptv-subscription.jpg
    └── placeholder.svg
```

## API Integration

### Supabase Storage API
- **Upload:** `supabase.storage.from('images').upload(filePath, file)`
- **Get URL:** `supabase.storage.from('images').getPublicUrl(filePath)`
- **Delete:** `supabase.storage.from('images').remove([filePath])`

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STORAGE_BUCKET_NAME=images
```

## Error Handling

### Upload Errors
- Invalid file type → Toast notification
- Upload failure → Retry with error message
- Network error → Graceful failure with user feedback

### Display Errors
- Image not found → Automatic fallback to next priority
- Network timeout → Show placeholder
- Invalid URL → Skip to next fallback

## Performance Considerations

### Optimizations
- Lazy loading images
- Image compression (handled by browser/Supabase)
- Batch upload reduces multiple network calls
- Cached public URLs
- Progressive image loading

### Best Practices
- Keep images under 5MB (Supabase free tier)
- Use WEBP format for better compression
- Optimize images before upload
- Use descriptive filenames
- Clean up unused images

## Security

### Implemented Measures
- File type validation (only images)
- Size limits enforced
- Supabase RLS policies
- Public bucket with read-only access
- Admin-only upload permissions
- Input sanitization

## Testing

### Manual Tests
1. ✅ Upload single image via drag & drop
2. ✅ Upload multiple images via file picker
3. ✅ Set primary image
4. ✅ Delete image
5. ✅ Fallback chain (local → Supabase → placeholder)
6. ✅ Loading states
7. ✅ Error handling
8. ✅ Build and compile

### Automated Tests
- Unit tests for utility functions
- Integration tests for components
- E2E tests for upload flow

## Future Enhancements

### Potential Improvements
- [ ] Image cropping/editing in admin panel
- [ ] CDN integration for faster delivery
- [ ] Image optimization on upload
- [ ] Multiple image formats per product
- [ ] Image search/filter in admin
- [ ] Bulk delete functionality
- [ ] Image analytics (views, clicks)
- [ ] AI-powered image tagging
- [ ] Responsive image srcset
- [ ] WebP auto-conversion

## Support

For issues or questions about the image management system:
1. Check README.md for usage instructions
2. Review this architecture document
3. Check browser console for errors
4. Verify Supabase configuration
5. Contact development team

---

**Last Updated:** 2025-12-05
**Version:** 1.0.0
**Status:** ✅ Production Ready
