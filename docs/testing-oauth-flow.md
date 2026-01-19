# Testing Google OAuth Login Flow

This document explains how to test the complete Google OAuth login flow from the landing page to dashboard.

## Prerequisites

1. Set up Google OAuth credentials in `.env.local`:
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

2. Start the development server:
```bash
npm run dev
```

## Test Scenarios

### 1. Manual Browser Testing (Recommended)

#### Step 1: Test Landing Page Navigation
```bash
# Open browser to http://localhost:3000
# Verify "Sign In" link exists and is clickable
# Check link href points to /auth/signin
```

#### Step 2: Test Sign In Page Rendering
```bash
# Navigate to http://localhost:3000/auth/signin
# Verify "Sign in with Google" button is present
# Check button has correct onClick handler
```

#### Step 3: Test Google OAuth Initiation
```bash
# Open browser dev tools (F12)
# Click "Sign in with Google" button
# Observe network request to /api/auth/sign-in/social
# Expected: POST with provider: "google"
# Verify redirect to accounts.google.com/oauth/authorize
```

#### Step 4: Test OAuth Callback
```bash
# After Google OAuth, you should be redirected to http://localhost:3000/api/auth/callback/google
# Verify this happens automatically
# Check for session cookie being set: better-auth.session_token
# Should redirect to /dashboard
```

#### Step 5: Test Dashboard Access
```bash
# Verify dashboard displays user information
# Check "Sign Out" button works
# Verify session persists across page reloads
```

### 2. Automated Testing with Tests

Run our integration tests:
```bash
npm test -- --run
```

All tests should pass, verifying:
- Navigation from home → sign in
- Google OAuth flow initiation
- OAuth callback handling
- Dashboard rendering with user data
- Sign out functionality

### 3. Command Line Testing

#### Test API Endpoints Directly
```bash
# Test sign-in endpoint
curl -X POST http://localhost:3000/api/auth/sign-in/social \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","callbackURL":"http://localhost:3000"}'

# Expected: 200 OK with authorization URL
# The response should contain a redirect URL to Google OAuth
```

#### Test Google OAuth Simulation
```bash
# Simulate Google OAuth callback (requires real credentials)
curl "http://localhost:3000/api/auth/callback/google?code=test_code&state=test_state" \
  -H "Accept: application/json"

# Expected: 302 redirect to /dashboard
# Check that session is created in database
```

### 4. Debugging Tips

If tests fail, check:
1. **Environment Variables**: Ensure `.env.local` has correct Google credentials
2. **Auth Configuration**: Verify Better-Auth routes are properly configured
3. **Network Issues**: Check if localhost is accessible and port 3000 is free
4. **Browser Settings**: Disable popup blockers for OAuth testing

### 5. Common Issues & Solutions

#### "callback not found" Error
- **Cause**: Google OAuth redirect URL doesn't match your app's callback route
- **Fix**: Ensure callback URL in Google Console matches: `http://localhost:3000/api/auth/callback/google`

#### "no code" Error  
- **Cause**: OAuth flow interrupted before code exchange
- **Fix**: Ensure network stability and complete OAuth flow

#### "state not found" Error
- **Cause**: State parameter lost during OAuth flow
- **Fix**: Check for proxy/CDN stripping parameters

### 6. Production Testing

For production testing:
1. Update callback URL in Google Cloud Console
2. Set appropriate environment variables
3. Test complete user journey from landing to dashboard

The OAuth flow should be seamless for users while maintaining security throughout the process.