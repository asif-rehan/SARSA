#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up environment variables...${NC}"

DB_USER="saas_user"
DB_PASSWORD="saas_password"
DB_NAME="saas_dev"
DB_HOST="localhost"
DB_PORT="5432"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL="http://localhost:3000"

cat > .env.local << ENVEOF
DATABASE_URL=${DATABASE_URL}

BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
BETTER_AUTH_URL=${BETTER_AUTH_URL}

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

RESEND_API_KEY=your_resend_api_key

# Default from email address for Resend
RESEND_FROM_EMAIL=noreply@sarsalab.xyz

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVEOF

echo -e "${GREEN}✓ .env.local file created successfully!${NC}"
echo -e "${YELLOW}Note: Please update Google OAuth credentials and Resend API key manually${NC}"

chmod 600 .env.local

echo -e "${GREEN}✓ Environment setup complete!${NC}"
