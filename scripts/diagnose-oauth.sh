#!/bin/bash

# Diagnostic script for OAuth and Database issues
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 SaaS Application Diagnostics${NC}"
echo -e "${BLUE}==================================${NC}"

# 1. Check Environment Variables
echo -e "\n${YELLOW}📋 Checking Environment Variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    echo -e "   GOOGLE_CLIENT_ID: $(grep GOOGLE_CLIENT_ID .env.local | cut -d'=' -f1 | cut -c1-20)..."
    echo -e "   GOOGLE_CLIENT_SECRET: $(grep GOOGLE_CLIENT_SECRET .env.local | cut -d'=' -f1 | cut -c1-20)..."
    echo -e "   DATABASE_URL: $(grep DATABASE_URL .env.local | cut -d'=' -f1 | cut -c1-20)..."
else
    echo -e "${RED}❌ .env.local file not found${NC}"
fi

# 2. Check Docker Container
echo -e "\n${YELLOW}🐳 Checking Docker Container...${NC}"
if docker ps | grep -q "saas-postgres-dev"; then
    echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
    
    # Test database connection
    if docker exec saas-postgres-dev psql -U saas_user -d saas_dev -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
    fi
    
    # Check tables
    TABLES=$(docker exec saas-postgres-dev psql -U saas_user -d saas_dev -tAc "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';")
    echo -e "   Tables found: ${TABLES}"
    
    # List tables
    echo -e "   Tables:"
    docker exec saas-postgres-dev psql -U saas_user -d saas_dev -c "\dt" 2>/dev/null || echo -e "   ${RED}Could not list tables${NC}"
else
    echo -e "${RED}❌ PostgreSQL container is not running${NC}"
    echo -e "   Run: npm run db:start"
fi

# 3. Check Next.js Server
echo -e "\n${YELLOW}🚀 Checking Next.js Server...${NC}"
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js server is running on port 3000${NC}"
    
    # Test health endpoint
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    echo -e "   HTTP Status: ${HTTP_STATUS}"
else
    echo -e "${RED}❌ Next.js server is not accessible${NC}"
    echo -e "   Run: npm run dev"
fi

# 4. Test Auth API Endpoints
echo -e "\n${YELLOW}🔐 Testing Auth API Endpoints...${NC}"

# Test sign-in endpoint
echo -e "   Testing POST /api/auth/sign-in/social:"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/auth_response.json -X POST http://localhost:3000/api/auth/sign-in/social \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","callbackURL":"http://localhost:3000"}' 2>/dev/null)

HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ OAuth initiation successful (200 + redirect URL)${NC}"
    if [ -f /tmp/auth_response.json ]; then
        echo -e "   Redirect URL generated:"
        echo -e "   $(cat /tmp/auth_response.json | jq -r '.url' | cut -c1-60)..."
    fi
elif [ "$HTTP_CODE" = "302" ]; then
    echo -e "   ${GREEN}✅ OAuth initiation successful (302 redirect)${NC}"
elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "   ${RED}❌ Server error (500)${NC}"
    if [ -f /tmp/auth_response.json ]; then
        echo -e "   Response body:"
        cat /tmp/auth_response.json | head -3 | sed 's/^/      /'
    fi
elif [ "$HTTP_CODE" = "400" ]; then
    echo -e "   ${YELLOW}⚠️  Bad request (400)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Unexpected response: ${HTTP_CODE}${NC}"
fi

# Test if Better Auth routes exist
echo -e "   Testing GET /api/auth/session:"
SESSION_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/session_response.json http://localhost:3000/api/auth/session 2>/dev/null)
SESSION_HTTP_CODE="${SESSION_RESPONSE: -3}"

if [ "$SESSION_HTTP_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Session endpoint accessible (200)${NC}"
elif [ "$SESSION_HTTP_CODE" = "401" ]; then
    echo -e "   ${GREEN}✅ Session endpoint working (401 - no session)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Session endpoint response: ${SESSION_HTTP_CODE}${NC}"
fi

# 5. Test Google OAuth Configuration
echo -e "\n${YELLOW}🔍 Testing Google OAuth Configuration...${NC}"
GOOGLE_CLIENT_ID=$(grep GOOGLE_CLIENT_ID .env.local 2>/dev/null | cut -d'=' -f2)

if [ -n "$GOOGLE_CLIENT_ID" ]; then
    echo -e "${GREEN}✅ Google Client ID found${NC}"
    
    # Test Google OAuth discovery endpoint
    if curl -s "https://accounts.google.com/.well-known/openid_configuration" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Google OAuth discovery endpoint accessible${NC}"
    else
        echo -e "${RED}❌ Cannot reach Google OAuth endpoints${NC}"
    fi
else
    echo -e "${RED}❌ Google Client ID not found${NC}"
fi

# 6. Common Issues and Fixes
echo -e "\n${YELLOW}💡 Common Issues and Fixes:${NC}"
echo -e "   1. If PostgreSQL is not running: npm run db:start"
echo -e "   2. If Next.js is not running: npm run dev"
echo -e "   3. If environment variables missing: ./scripts/setup-env.sh"
echo -e "   4. If OAuth fails: Check Google Console redirect URIs"
echo -e "      Should include: http://localhost:3000/api/auth/callback/google"

# 7. Clean up
rm -f /tmp/auth_response.json /tmp/session_response.json

echo -e "\n${BLUE}🏁 Diagnostics Complete${NC}"