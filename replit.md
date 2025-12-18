# StreamStickPro - Jailbroken Fire Stick E-commerce Platform

## PROJECT STATUS: ✅ PRODUCTION-READY (INDEPENDENT INFRASTRUCTURE)

**Latest Deployment:** December 17, 2025
- Production URL: https://streamstickpro.com
- Cloudflare: https://cafdfbad.streamerstickpro-live.pages.dev
- Branch: `clean-main`
- Database: Supabase PostgreSQL (81 blog posts)
- All features production-ready

**Independent Architecture (No Replit Dependencies):**
- Code Repository: GitHub (reloadedfiretvteam/streamerstickpro-live)
- CI/CD: GitHub Actions (auto-deploy on push to clean-main)
- Hosting: Cloudflare Pages + Workers
- Database: Supabase PostgreSQL
- Payments: Stripe
- Email: Resend
- See `GITHUB_SECRETS.md` for complete secrets configuration

## Overview

StreamStickPro is a full-stack e-commerce application for selling jailbroken Fire Sticks and IPTV subscriptions. The platform implements a dual-store architecture with product cloaking to present different products to customers versus payment processors. It features automated email delivery of credentials, Stripe payment integration, and a comprehensive admin panel with 81 SEO-optimized blog posts targeting US, UK, and Canada markets.

**Recent Updates (December 2025):**
- Added 32 new SEO blog posts covering Premier League, NHL, Sky Sports, NFL, MotoGP/F1, Cricket, Boxing, and family streaming guides
- Updated navigation to use query parameters (?section=shop) for reliable page routing
- Fixed WhatsApp chat button z-index for proper visibility
- Updated messaging to emphasize "10-minute setup" with instant credentials and 24/7 support
- Configured wrangler.toml with production secrets and environment variables
- Set CLOUDFLARE_ACCOUNT_ID environment variable

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Structure

**Monorepo Layout:**
- `client/` - React frontend with Vite
- `server/` - Express.js backend
- `shared/` - Shared TypeScript schemas and types
- Single build process that bundles both client and server

**Technology Stack:**
- Frontend: React 18, TypeScript, Vite, TailwindCSS
- UI Library: Shadcn/ui (Radix UI components)
- Backend: Express.js, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Payments: Stripe Checkout & Payment Intents
- Email: Resend API
- State Management: Zustand for cart, TanStack Query for server state

### Dual-Store Architecture (Product Cloaking)

**Core Concept:**
The application maintains two separate product catalogs to comply with payment processor policies:

1. **Main Store (Customer-Facing):**
   - Domain: Primary domain (e.g., mywebsite.com)
   - Products: Jailbroken Fire Sticks ($140-$160) and IPTV subscriptions ($15-$75)
   - Route: `/` (MainStore.tsx)

2. **Shadow Store (Payment Processor View):**
   - Domain: Separate subdomain (e.g., shadow.mysite.com)
   - Products: Generic "Web Design" and "SEO" services with matching prices
   - Route: `/shadow-services` (ShadowStore.tsx)
   - Customers never see this page directly

**Mapping Logic:**
- Each real product has a corresponding shadow product in Stripe
- `realProducts` table stores the mapping: `shadowProductId` → `realProductId`
- During checkout, the shadow product is sent to Stripe
- Webhooks reverse the mapping to deliver correct credentials

### Database Schema

**Tables (Drizzle ORM):**

1. `users` - Admin authentication
   - id, username, password (hashed)

2. `orders` - Complete order tracking
   - Customer info (email, name)
   - Stripe IDs (payment_intent, checkout_session, customer)
   - Shadow product references (shadowProductId, shadowPriceId)
   - Real product references (realProductId, realProductName)
   - Status tracking, credentials sent flag

3. `realProducts` - Main product catalog
   - Product details (name, price, description, features)
   - Category (firestick/iptv)
   - Shadow product mapping (shadowProductId)
   - Images stored via URL references (Supabase Storage)

4. `blogPosts` - Blog content system
   - Full SEO optimization (keywords, meta tags, SEO scores)
   - Real-time scoring (heading score, keyword density, content length, meta, structure)
   - Publishing controls (featured, published, publishedAt)
   - Product linking (linkedProductIds array)

**Design Decisions:**
- Using PostgreSQL for relational integrity between products and orders
- Drizzle ORM chosen for type-safe queries and schema management
- UUID primary keys for security and distributed scalability
- Indexed foreign keys (payment_intent, checkout_session) for fast webhook lookups

### Payment Flow

**Stripe Integration Pattern:**

1. **Checkout Initiation:**
   - Customer adds products to cart (Zustand state)
   - Navigates to `/checkout`
   - Form collects email, name
   - Frontend calls `/api/checkout` with shadow product IDs

2. **Server-Side Checkout:**
   - Maps real products to shadow products
   - Creates Stripe Checkout Session with shadow products
   - Stores order in database with both real and shadow references
   - Returns Stripe session URL

3. **Redirect & Payment:**
   - Customer redirected to Stripe Checkout (on shadow domain)
   - Stripe displays shadow product names ("Web Design Basic", etc.)
   - Customer completes payment with saved cards, Apple Pay, Google Pay

4. **Webhook Processing:**
   - Stripe sends webhooks to `/api/stripe/webhook`
   - Raw body preserved for signature verification (middleware order critical)
   - `stripe-replit-sync` package syncs webhook events to database
   - Custom handlers process `checkout.session.completed` and `payment_intent.succeeded`
   - Orders updated with payment status

5. **Email Delivery:**
   - Immediate: Order confirmation email
   - Delayed (5 minutes): Credentials email with IPTV portal URL and setup video
   - Separate flows for Fire Stick vs IPTV-only products

**Why This Approach:**
- Stripe Checkout provides hosted payment page (PCI compliance handled)
- Shadow products prevent payment processor policy violations
- Webhook-based fulfillment ensures reliable credential delivery
- Database stores complete audit trail

### Email Service Architecture

**Provider:** Resend API

**Email Templates:**
1. Order Confirmation - Immediate upon checkout completion
2. Credentials Email - Delayed 5 minutes, contains:
   - IPTV username/password (generated from order ID + timestamp)
   - Portal URL: http://ky-tv.cc
   - YouTube setup video link
   - Fire Stick specific instructions (conditional)

**Design Pattern:**
- API keys managed via Cloudflare Worker environment variables
- Credentials stored in wrangler.toml secrets configuration

### Frontend Architecture

**Routing:** Wouter (lightweight React router)

**Key Pages:**
- `/` - Main store with Fire Stick and IPTV products
- `/shadow-services` - Shadow store (corporate design theme)
- `/checkout` - Cart review and payment
- `/success` - Post-purchase confirmation
- `/admin` - Admin panel (product management, orders, analytics)
- `/blog` - SEO content pages

**State Management:**
- Cart: Zustand store (`useCart`) with localStorage persistence
- Server Data: TanStack Query with React Query hooks
- Form State: React Hook Form with Zod validation

**UI Patterns:**
- Dark theme by default (streamer aesthetic)
- Shadow store forces light theme via CSS class manipulation
- Responsive design with Tailwind breakpoints
- Embla Carousel for sports image rotation
- Framer Motion for page transitions and animations

**Component Library:**
Shadcn/ui provides 40+ pre-built components (buttons, cards, dialogs, forms, etc.) built on Radix UI primitives. Fully customizable via Tailwind and variant APIs.

### Image Storage Strategy

**Provider:** Supabase Storage

**Bucket Structure:**
- Product images organized by category
- Background images for hero sections
- Sports carousel images (UFC, NFL, NBA, MLB)
- OpenGraph social sharing image

**Access Pattern:**
- Public bucket with direct URL access
- `getStorageUrl()` helper constructs CDN URLs
- Fallback to placeholder images if Supabase unavailable
- Admin panel allows image uploads (multipart form data)

**Why Supabase:**
- Free tier supports small catalogs
- Built-in CDN for fast delivery
- Simple REST API for uploads
- Bucket policies for access control

### Admin Panel Features

**Dashboard:**
- Real-time visitor analytics (if tracking enabled)
- Order statistics and revenue metrics
- Recent orders table with status indicators

**Product Management:**
- CRUD operations on real products
- Image upload to Supabase
- Pricing sync between real and shadow products
- Category filtering (Fire Stick vs IPTV)

**Order Management:**
- View all orders with search/filter
- Manual status updates
- Resend credentials emails
- Customer information display

**Blog/SEO:**
- 49+ seeded blog posts (Fire Stick guides, cord-cutting tips, sports streaming)
- SEO-optimized with real scoring system
- Slug-based routing for SEO
- Featured posts and categories
- Seed endpoint: POST /api/admin/seed-blog populates database

**Design Decision:**
Admin panel is intentionally simple - no complex dashboards or charts. Focus on core operations: managing products and viewing orders. Analytics are basic (visitor counts) as main goal is e-commerce, not metrics.

## External Dependencies

### Payment Processing
- **Stripe:** Checkout Sessions, Payment Intents, Webhooks
- Credentials managed via Cloudflare Worker environment variables

### Email Service
- **Resend:** Transactional email API
- Credentials via Cloudflare Worker environment variables

### Database
- **Supabase (PostgreSQL):** Primary data store
- Managed via Cloudflare Worker environment variables
- Direct Supabase client connections

### Storage
- **Supabase Storage:** Image hosting and CDN
- Optional - app functions without it (placeholder images)
- Public bucket access pattern
- Credentials via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Development Tools
- **Vite:** Frontend build tool and dev server
- **esbuild:** Server bundler for production
- **Replit Plugins:** Dev banner, cartographer (development only)
- **TailwindCSS:** Utility-first styling with custom theme

### Third-Party Integrations
- **YouTube:** Embedded setup video links
- **IPTV Portal:** External service at http://ky-tv.cc (customer access point)

### NPM Packages (Key Dependencies)
- UI: `@radix-ui/*` components, `lucide-react` icons, `framer-motion` animations
- Forms: `react-hook-form`, `@hookform/resolvers`, `zod` validation
- Data: `drizzle-orm`, `@tanstack/react-query`
- Carousel: `embla-carousel-react`, `embla-carousel-autoplay`
- Utilities: `date-fns`, `nanoid`, `zustand`