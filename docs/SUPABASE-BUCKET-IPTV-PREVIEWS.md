# Supabase bucket: iptv-previews (Nuclear prompt)

For channel thumbnails and device screenshots (93K catalog / AEO).

## Create in Supabase Dashboard

1. **Storage → New bucket**
2. **Name:** `iptv-previews`
3. **Public bucket:** Yes (so CDN URLs can be used in meta images and Schema)
4. **File size limit:** 2 MB (or as needed for thumbnails)
5. **Allowed MIME types:** image/jpeg, image/png, image/webp

## RLS (optional)

If you need to restrict uploads to admin only:

- Create policy: `INSERT` for authenticated users with admin role, or use service role for server uploads.
- For public read-only: allow `SELECT` for `anon` so catalog pages can show thumbnails.

## Usage

- Channel thumbnails: e.g. `iptv-previews/channels/{country}/{channel_id}.jpg`
- Device screenshots: e.g. `iptv-previews/devices/onn-4k-pro.jpg`
- Reference in app: `getStorageUrl('iptv-previews', path)` (see existing `getStorageUrl` in client for your Supabase project).

## Migration

Catalog tables (`iptv_channels`, `movies`, `series`, `seo_impressions`) are created by migration `20260209100000_ultimate_catalog_tables.sql`. The bucket is created manually in the dashboard as above.
