#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== SaaS Application Initial Setup Script ===${NC}"

if [ -d "saas-app" ] || [ -f "package.json" ]; then
  echo -e "${RED}Error: Project directory already exists. Please clean up first.${NC}"
  exit 1
fi

echo -e "${YELLOW}Step 1: Creating Next.js project...${NC}"
npx create-next-app@latest saas-app --typescript --tailwind --app --eslint --no-src-dir --use-npm --no-react-compiler --import-alias "@/*"

echo -e "${YELLOW}Step 2: Moving files to root and cleaning up...${NC}"
mv saas-app/* saas-app/.* . 2>/dev/null || true
rmdir saas-app

echo -e "${YELLOW}Step 3: Initializing git...${NC}"
git init
git add .
git commit -m "Initial commit: Next.js setup"

echo -e "${YELLOW}Step 4: Installing core dependencies...${NC}"
npm install better-auth kysely@^0.28.5 pg

echo -e "${YELLOW}Step 5: Installing dev dependencies...${NC}"
npm install -D @types/pg kysely-codegen

echo -e "${YELLOW}Step 6: Installing testing dependencies...${NC}"
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
npm install -D playwright @playwright/test
npm install -D @testing-library/user-event

echo -e "${YELLOW}Step 7: Installing environment variables...${NC}"
npm install -D dotenv-cli

echo -e "${YELLOW}Step 8: Creating docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: saas-postgres-dev
    environment:
      POSTGRES_USER: saas_user
      POSTGRES_PASSWORD: saas_password
      POSTGRES_DB: saas_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saas_user -d saas_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
EOF

echo -e "${YELLOW}Step 9: Creating scripts directory...${NC}"
mkdir -p scripts

echo -e "${YELLOW}Step 10: Creating setup-env.sh script...${NC}"
cat > scripts/setup-env.sh << 'EOF'
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

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

RESEND_API_KEY=your_resend_api_key
ENVEOF

echo -e "${GREEN}✓ .env.local file created successfully!${NC}"
echo -e "${YELLOW}Note: Please update Google OAuth credentials manually${NC}"

chmod 600 .env.local

echo -e "${GREEN}✓ Environment setup complete!${NC}"
EOF

chmod +x scripts/setup-env.sh

echo -e "${YELLOW}Step 11: Creating lib directory and auth files...${NC}"
mkdir -p lib

cat > lib/db.ts << 'EOF'
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely({
  dialect,
});
EOF

cat > lib/auth.ts << 'EOF'
import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
EOF

cat > lib/auth-client.ts << 'EOF'
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
EOF

echo -e "${YELLOW}Step 12: Creating testing configuration...${NC}"
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
EOF

cat > vitest.setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
EOF

cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF

echo -e "${YELLOW}Step 13: Updating package.json scripts...${NC}"
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.test="vitest"
npm pkg set scripts["test:ui"]="vitest --ui"
npm pkg set scripts["test:e2e"]="playwright test"
npm pkg set scripts["test:e2e:ui"]="playwright test --ui"
npm pkg set scripts["db:start"]="docker-compose up -d"
npm pkg set scripts["db:stop"]="docker-compose down"
npm pkg set scripts["db:migrate"]="npx better-auth migrate"
npm pkg set scripts.setup="./scripts/setup-env.sh && npm run db:start && npm run db:migrate"

echo -e "${YELLOW}Step 14: Creating test directories...${NC}"
mkdir -p __tests__/unit
mkdir -p __tests__/integration
mkdir -p e2e

echo -e "${GREEN}✓ Initial setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run: ./scripts/setup-env.sh"
echo "2. Run: npm run db:start"
echo "3. Run: npm run db:migrate"
echo "4. Update Google OAuth credentials in .env.local"
echo "5. Run: npm run dev"