# SaaS Application Template

A production-ready SaaS application built with Next.js, Better-Auth, Stripe, and PostgreSQL.

## Features

- 🔐 **Authentication**: Google OAuth and email/password with Better-Auth
- 💳 **Payments**: Stripe integration for subscriptions
- 📧 **Email**: Resend integration for transactional emails
- 🗄️ **Database**: PostgreSQL with Kysely query builder
- 🎨 **UI**: Modern design with Tailwind CSS and shadcn/ui
- 🧪 **Testing**: Comprehensive test suite with Vitest and Playwright
- 📱 **Responsive**: Mobile-first design

## Quick Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd saas-app
   npm install
   ```

2. **Set up the environment:**
   ```bash
   npm run setup
   ```
   This will create `.env.local`, start the database, and run migrations.

3. **Configure Stripe (required for subscriptions):**
   ```bash
   npm run stripe:setup
   ```
   This will create Stripe products and update your environment variables.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Environment Configuration

The setup script creates a `.env.local` file with the following variables:

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Authentication (Better-Auth)
- `BETTER_AUTH_SECRET` - Secret key for Better-Auth
- `BETTER_AUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Email (Resend)
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Default sender email

### Payments (Stripe)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Stripe Setup

1. **Get your Stripe keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Get your test keys from the API keys section
   - Add them to your `.env.local` file

2. **Create products and prices:**
   ```bash
   npm run stripe:setup
   ```
   This script will:
   - Create products for Basic, Pro, and Enterprise plans
   - Create monthly recurring prices
   - Update your `.env.local` with the real price IDs

3. **Set up webhooks (for production):**
   - In Stripe Dashboard, go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:start     # Start PostgreSQL container
npm run db:stop      # Stop PostgreSQL container
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database

# Testing
npm test -- --run    # Run unit/integration tests
npm run test:e2e     # Run end-to-end tests
npm run test:ui      # Run tests with UI (interactive)

# Stripe
npm run stripe:setup # Set up Stripe products and prices
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── subscription/      # Subscription management
├── components/            # Reusable React components
├── lib/                   # Core application logic
├── __tests__/            # Test files
├── e2e/                  # End-to-end tests
└── scripts/              # Setup and utility scripts
```

## Testing

This project includes comprehensive testing:

- **Unit Tests**: Component and utility testing with Vitest
- **Integration Tests**: API and database testing
- **Property-Based Tests**: Advanced testing with random inputs
- **End-to-End Tests**: Full user journey testing with Playwright

Run tests with:
```bash
npm test -- --run        # All unit/integration tests
npm run test:e2e         # End-to-end tests
```

## Deployment

### Environment Variables

Make sure to set all required environment variables in your production environment:

1. Database connection string
2. Better-Auth configuration
3. Google OAuth credentials
4. Resend API key
5. Stripe keys and webhook secret

### Database

Run migrations in production:
```bash
npx @better-auth/cli migrate --yes
```

### Stripe Webhooks

Set up webhook endpoints in your Stripe dashboard pointing to:
```
https://yourdomain.com/api/stripe-webhook
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better-Auth Documentation](https://better-auth.com)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
