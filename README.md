# The Boring Template

A modern, full-featured Next.js 15 template for building SaaS applications with TypeScript, TailwindCSS, and more. Built with a minimalist approach, focusing on essential dependencies to ensure optimal performance and maintainability while reducing third-party overhead.
tri

Official template: www.docs.boringtemplate.com

## Features

- ⚡️ **Next.js 15** with App Router and Server Actions
- 🎨 **TailwindCSS** for styling with **Shadcn UI** components
- 🔒 **Better-auth** for authentication (Google, Github, Email and more...)
- 📊 **Drizzle ORM** with PostgreSQL (Neon.tech)
- 🚦 **Rate Limiting** with Upstash Redis
- 💳 **Stripe** integration for payments
- 📝 **React Hook Form** for form handling
- 🗃️ **AWS S3** for file storage
- 📧 **Resend** for email services
- 🔐 **TypeScript** for type safety
- 🎯 **Prettier** for code formatting
- 🚀 **User Onboarding** with step-by-step guide
- 👥 **Workspace / Organizations** multi-tenant support
- ⚙️ **Advanced Settings System** for user and workspace management
- 💼 **Complete Dashboard** with CRUD operations, settings forms, and workspace / organization management
- 🌐 **Modern Landing Pages** including Home, About, Contact, and Pricing pages
- 🎭 **Theme Support** with Light/Dark mode
- 🏢 **Multi-tenant Ready** with organization switching and member invitations
- 💎 **Premium Features** including custom workspaces, role-based access control, and advanced analytics
- ⚡️ **Production Ready** with optimized performance, security best practices, and scalable architecture
- 💰 **Built-in Pricing Plans** with Free Trial, Starter, and Pro tiers - fully integrated with Stripe
- 🔍 **SEO Optimized** with metadata, Open Graph tags, and dynamic sitemap generation
- **Keyboard shortcuts** for navigation and actions
- **Fully Customizable** - easily modify and adapt to your needs

### Components

#### 🎯 Landing Components

- **Header** - Modern navigation with responsive design
- **Hero** - Engaging hero section for main message
- **Problem** - Problem statement section
- **Features** - Feature showcase grid
- **CTA** - Call-to-action sections
- **Pricing** - Pricing plans display
- **FAQ** - Frequently asked questions

#### 💼 App Components

- **Sidebar** - Responsive navigation sidebar
- **User Button** - User profile and settings dropdown
- **Workspace Switcher** - Organization/workspace selector
- **CRUD Forms** - Forms with Zod validation
- **Image Upload** - Dropzone with image upload
- **Members** - Team member management
- **Invitations** - User invitation system
- **Settings** - User and workspace settings
- **Notifications** - Real-time notifications
- **Onboarding** - User onboarding flow
- **Providers** - Authentication providers
- **Profile** - User profile management

#### 📦 Packages

- **Radix UI** - Unstyled, accessible UI components
- **Upstash Redis** - Redis client for rate limiting and caching
- **Drizzle ORM** - TypeScript ORM for database operations
- **Lucide React** - Beautiful, consistent icon set
- **Next.js** - React framework for production
- **Better-auth.js** - Authentication for Next.js
- **nuqs** - URL state management
- **React Day Picker** - Flexible date picker component
- **React Dropzone** - Drag & drop file upload
- **React Hook Form** - Form state management and validation
- **React Icons** - Popular icon libraries
- **Resend** - Email service integration
- **Recharts** - Composable charting library
- **Stripe** - Payment processing integration
- **Sonner** - Toast notifications
- **TailwindCSS** - Utility-first CSS framework
- **Vaul** - Drawer component
- **Zod** - TypeScript-first schema validation
- **Zustand** - State management

## Getting Started

### Prerequisites

- Package Manager ([Bun](https://bun.sh/), [npm](https://www.npmjs.com/), or [Yarn](https://yarnpkg.com/))
- Node.js 18+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/the-boring-template.git
cd the-boring-template
```

2. Install dependencies:

```bash
bun install
```

or

```bash
yarn
```

or

```bash
npm install
```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
# Database (Neon.tech PostgreSQL)
DATABASE_URL=your_neon_database_url

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_EMAIL=your_verified_email

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# BetterAuth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_nextauth_secret // Generate here: https://auth-secret-gen.vercel.app/

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_UPLOAD_BUCKET=your_bucket_name

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Payments (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBGOOK=your_stripe_webhook_secret
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# App Encryption (used for encrypting and decrypting)
ENCRYPTION_KEY=your_encryption_key
```

### Development Scripts

- `bun dev`: Start development server with Turbopack
- `bun build`: Build the application
- `bun start`: Start production server
- `bun lint`: Run linting checks

### Database Management

- `bun db:generate`: Generate database migrations
- `bun db:migrate`: Run database migrations
- `bun db:push`: Push schema changes to database
- `bun db:seed`: Seed the database (for user roles)
- `bun db:setup`: Run migrations and seed
- `bun db:studio`: Open Drizzle Studio
- `bun db:drop`: Drop the database

### Code Quality

- `bun format`: Check code formatting
- `bun format:fix`: Fix code formatting
- `bun check:unused`: Check for unused dependencies
- `bun check:files`: Check for unused exports

## Configuration

### App Constants

The main application constants are defined in `lib/constants.ts`:

- Rate limiting configurations
- Other important constants

## Help

Contact me om mail or Twitter for help.
kevinminh.ng@gmail.com

## License
