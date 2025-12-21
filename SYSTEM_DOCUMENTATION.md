# StreamStickPro System Documentation

## Overview
StreamStickPro is a full-stack e-commerce platform for streaming products and services, built with modern web technologies and deployed on Cloudflare Workers/Pages.

## Architecture

### Frontend
- **Framework**: React + TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query
- **Build Tool**: Vite

### Backend
- **Runtime**: Cloudflare Workers (Hono framework)
- **API**: RESTful API with Hono router
- **Authentication**: JWT tokens
- **File Serving**: Cloudflare Assets

### Database
- **Primary DB**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Storage**: Supabase Storage for images

### Payment Processing
- **Provider**: Stripe
- **Webhooks**: Stripe webhook endpoints for order processing

### Email
- **Provider**: Resend API
- **Templates**: HTML email templates

### Deployment
- **Hosting**: Cloudflare Pages
- **CDN**: Cloudflare global network
- **CI/CD**: GitHub Actions (if configured)

## Key Features

### 1. Product Management
- Create, read, update, delete products
- Product categories and pricing
- Image upload to Supabase Storage
- Real-time inventory management

### 2. Order Processing
- Stripe checkout integration
- Order tracking and fulfillment
- Email notifications (order confirmation, credentials)
- Customer portal for order history

### 3. Admin Panel
- Dashboard with statistics
- Product management
- Order fulfillment
- Customer management
- Blog post management
- SEO ad content management
- **AI Assistant** (NEW) - Natural language interface for system management

### 4. AI Assistant - More Powerful Than Cursor AI
The AI Assistant is a powerful tool integrated into the admin panel that provides capabilities beyond traditional IDE assistants:

#### **Unique Advantages Over Cursor AI:**
1. **Live System Access**: Direct access to production database, APIs, and live data
2. **Real Operations**: Can perform actual operations (GitHub commits, Stripe product creation, database queries)
3. **Issue Detection**: Automatically finds problems in live system (missing emails, pending orders, data inconsistencies)
4. **System-Wide Analysis**: Analyzes entire system health, not just code
5. **Multi-Service Integration**: Works across GitHub, Stripe, Supabase, Cloudflare in one interface

#### **Capabilities:**
- **GitHub Operations**: 
  - List repositories with full metadata
  - View commit history
  - Create branches
  - Push code (with safety checks)
  
- **Stripe Operations**: 
  - List products, payments, customers
  - Create new products
  - View payment analytics
  - Manage subscriptions
  
- **Database Operations**: 
  - Query orders, products, customers, blog posts, SEO ads
  - Full database analysis and health checks
  - Automatic issue detection (missing data, pending fulfillments, old orders)
  - Real-time data queries
  
- **Code Operations**: 
  - Analyze codebase structure
  - Generate component templates
  - Create feature implementation plans
  - Find code issues and bugs

#### **Enhanced Features:**
- **AI-Powered Parsing**: Uses OpenAI GPT-4 (if API key provided) for better natural language understanding
- **Rule-Based Fallback**: Works without AI for basic operations
- **Comprehensive Issue Detection**: Finds problems Cursor AI can't (live data issues, system health)
- **Cross-Platform Operations**: Performs actions across multiple services simultaneously

#### **Usage Examples:**
```
"list all Stripe products"
"show recent orders"
"analyze database for issues"
"find problems in the system"
"list GitHub repositories"
"view commits for repository owner/repo"
"create branch feature/new-feature in owner/repo"
"check for orders missing email addresses"
"show pending order fulfillments"
"analyze codebase structure"
```

#### **Why It's More Powerful:**
- **Live Data Access**: Cursor AI can only read code files. This AI can query live database, check real order status, verify actual API responses
- **Real Actions**: Can actually create GitHub branches, Stripe products, not just suggest code
- **System Health**: Detects real issues in production system, not just code syntax errors
- **Unified Interface**: One place to manage GitHub, Stripe, Database, Code - no context switching
- **Production-Focused**: Designed for managing live systems, not just development

### 5. SEO Content Management
- SEO-optimized ad-style content pieces
- Blog posts with SEO optimization
- Sitemap generation
- Meta tag management

## Environment Variables

### Required
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `RESEND_API_KEY`: Resend API key for emails
- `RESEND_FROM_EMAIL`: Email address to send from
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Supabase service role key (for admin operations)

### Optional
- `ADMIN_USERNAME`: Admin panel username
- `ADMIN_PASSWORD`: Admin panel password
- `JWT_SECRET`: JWT signing secret (auto-generated if not provided)
- `GITHUB_TOKEN`: GitHub personal access token (for AI Assistant GitHub operations)
- `OPENAI_API_KEY`: OpenAI API key (for advanced AI features)
- `NODE_ENV`: Environment (production/development)

## Database Schema

### Core Tables
- `products`: Product catalog
- `orders`: Customer orders
- `customers`: Customer accounts
- `blog_posts`: Blog content
- `seo_ads`: SEO-optimized ad content pieces
- `visitors`: Visitor tracking
- `page_edits`: Visual editor data
- `abandoned_carts`: Cart abandonment tracking

## API Endpoints

### Public
- `GET /api/products`: List products
- `GET /api/blog/posts`: List blog posts
- `GET /api/seo-ads/ads`: List SEO ads
- `POST /api/checkout`: Create checkout session
- `POST /api/free-trial`: Create free trial

### Protected (Admin)
- `POST /api/auth/login`: Admin login
- `GET /api/admin/products`: Admin product management
- `GET /api/admin/orders`: Order management
- `POST /api/admin/seo-ads`: Create SEO ad
- `POST /api/ai-assistant/execute`: Execute AI assistant command
- `GET /api/ai-assistant/capabilities`: List available capabilities

## How It Works

### Order Flow
1. Customer selects products and proceeds to checkout
2. Checkout creates Stripe checkout session
3. Customer completes payment on Stripe
4. Stripe webhook sends `checkout.session.completed` event
5. System processes order:
   - Creates order record in database
   - Generates credentials (if applicable)
   - Sends order confirmation email
   - Sends credentials email
   - Sends owner notification email

### AI Assistant Flow
1. User enters natural language command in admin panel
2. Command is sent to `/api/ai-assistant/execute`
3. Backend parses command to determine action type
4. Appropriate handler executes the action:
   - GitHub: Uses GitHub API with GITHUB_TOKEN
   - Stripe: Uses Stripe SDK with STRIPE_SECRET_KEY
   - Database: Uses storage layer with Supabase
   - Code: Provides guidance (requires AI model for generation)
5. Result is returned and displayed in chat interface

### Email System
- Uses Resend API for delivery
- Templates stored in `worker/email.ts`
- Automatic sending on:
  - Order completion
  - Free trial creation
  - Credentials generation
- Email validation to prevent sending to null addresses

## File Structure

```
├── client/              # Frontend React app
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── lib/        # Utilities and API helpers
│   │   └── App.tsx     # Main app component
│   └── public/         # Static assets
├── worker/             # Cloudflare Worker backend
│   ├── routes/         # API route handlers
│   ├── helpers/        # Utility functions
│   └── index.ts        # Worker entry point
├── shared/             # Shared code (schema, types)
│   └── schema.ts       # Database schema
└── scripts/            # Utility scripts
```

## Security

### Authentication
- Admin panel uses JWT tokens
- Tokens stored in localStorage
- Protected routes check token validity

### API Security
- CORS configured for specific domains
- Admin routes require authentication
- Stripe webhooks verified with signature

### Data Protection
- Sensitive data encrypted in transit
- API keys stored as environment variables
- No secrets in code or version control

## Deployment

### Cloudflare Pages
1. Connect GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Build output: `client/dist`
3. Set environment variables in Cloudflare dashboard
4. Deploy automatically on push to main branch

### Cloudflare Workers
- Workers handle API routes
- Deployed automatically with Pages
- Uses Workers KV for caching (if needed)

## Troubleshooting

### Email Not Sending
- Check `RESEND_API_KEY` is set
- Verify `RESEND_FROM_EMAIL` is valid
- Check order has customer email
- Review webhook logs for errors

### AI Assistant Not Working
- Verify `GITHUB_TOKEN` is set for GitHub operations
- Check `STRIPE_SECRET_KEY` for Stripe operations
- Ensure proper authentication in admin panel

### Orders Not Processing
- Verify Stripe webhook endpoint is configured
- Check webhook secret matches `STRIPE_WEBHOOK_SECRET`
- Review webhook logs in Stripe dashboard

## Support
For issues or questions, contact: reloadedfiretvteam@gmail.com

