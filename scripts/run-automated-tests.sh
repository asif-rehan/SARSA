#!/bin/bash

# Automated Test Suite for SaaS Application
# This script runs all automated tests as planned in SaaS_Guide.md

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Running Automated Test Suite for SaaS Application${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Function to run tests and check results
run_test_suite() {
    local test_name=$1
    local test_command=$2
    local description=$3
    
    echo -e "\n${YELLOW}📋 Running: ${test_name}${NC}"
    echo -e "${BLUE}Description: ${description}${NC}"
    echo -e "${BLUE}Command: ${test_command}${NC}"
    echo "----------------------------------------"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ ${test_name} - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ ${test_name} - FAILED${NC}"
        return 1
    fi
}

# Track overall results
FAILED_TESTS=0
TOTAL_TESTS=0

# 1. Unit Tests
run_test_suite "Unit Tests" \
    "npm test -- --run __tests__/unit/" \
    "Test individual components in isolation" \
|| ((FAILED_TESTS++))
((TOTAL_TESTS++))

# 2. Integration Tests - OAuth API
run_test_suite "OAuth API Integration Tests" \
    "npm test -- --run __tests__/integration/auth/oauth-api.test.ts" \
    "Test Google OAuth API endpoints and flows" \
|| ((FAILED_TESTS++))
((TOTAL_TESTS++))

# 3. Integration Tests - Database Health
run_test_suite "Database Health Integration Tests" \
    "npm test -- --run __tests__/integration/database-health.test.ts" \
    "Test database connectivity and Better-Auth schema" \
|| ((FAILED_TESTS++))
((TOTAL_TESTS++))

# 4. E2E Tests - Landing Page
run_test_suite "Landing Page E2E Tests" \
    "npm run test:e2e -- e2e/landing-page.spec.ts" \
    "Test landing page navigation and user interactions" \
|| ((FAILED_TESTS++))
((TOTAL_TESTS++))

# 5. E2E Tests - Google OAuth Flow
run_test_suite "Google OAuth E2E Tests" \
    "npm run test:e2e -- e2e/google-oauth.spec.ts" \
    "Test complete Google OAuth authentication flow" \
|| ((FAILED_TESTS++))
((TOTAL_TESTS++))

# 6. E2E Tests - OAuth Flow Automation
run_test_suite "OAuth Flow Automation Tests" \
    "npm run test:e2e -- e2e/oauth-flow-automation.spec.ts" \
    "Automated testing of OAuth flow from docs/testing-oauth-flow.md" \
|| ((FAILED_TESTS++))
((TOTAL_TESTS++))

# Summary
echo -e "\n${BLUE}=====================================================${NC}"
echo -e "${BLUE}📊 Test Suite Summary${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo -e "Total Test Suites: ${TOTAL_TESTS}"
echo -e "Passed: $((TOTAL_TESTS - FAILED_TESTS))"
echo -e "Failed: ${FAILED_TESTS}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All test suites passed!${NC}"
    echo -e "${GREEN}✅ Epic 1-4 test automation is complete${NC}"
    echo -e "${GREEN}✅ Integration and E2E tests implemented as planned${NC}"
    echo -e "${GREEN}✅ OAuth flow testing is automated${NC}"
    echo -e "${GREEN}✅ Database health checks are in place${NC}"
    
    exit 0
else
    echo -e "\n${RED}❌ Some test suites failed. Please review the output above.${NC}"
    echo -e "${RED}🔧 Check the failing tests and fix any issues.${NC}"
    
    exit 1
fi