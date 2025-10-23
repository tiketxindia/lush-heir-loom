# Fix Google OAuth Branding - Show "LushHeirLoom" Instead of Supabase URL

## 🎯 Problem
Google OAuth is showing "Choose an account to continue to ezfbekvpmzykjniyyrof.supabase.co" instead of "Choose an account to continue to LushHeirLoom"

## 🔧 Solution: Update Google Cloud Console Settings

### Step 1: Google Cloud Console OAuth Consent Screen
1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > OAuth consent screen
3. **Update Application Information**:
   - **Application name**: `LushHeirLoom`
   - **User support email**: Your business email
   - **Application homepage**: `https://lushheirloom.com` (or your domain)
   - **Application privacy policy**: `https://lushheirloom.com/privacy`
   - **Application terms of service**: `https://lushheirloom.com/terms`

### Step 2: Update OAuth Client Configuration
1. **Navigate to**: APIs & Services > Credentials
2. **Click on your OAuth 2.0 Client ID**
3. **Update Name**: Change from default to `LushHeirLoom Web Client`
4. **Authorized redirect URIs**: Ensure these are set:
   - `https://ezfbekvpmzykjniyyrof.supabase.co/auth/v1/callback`
   - `http://localhost:8081/auth/callback` (for development)

### Step 3: Supabase Configuration
1. **Go to**: https://app.supabase.com/project/ezfbekvpmzykjniyyrof
2. **Navigate to**: Authentication > Providers > Google
3. **Update Settings**:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
   - **Skip nonce check**: ✅ (recommended for OAuth)

### Step 4: Site URL Configuration in Supabase
1. **Navigate to**: Authentication > URL Configuration
2. **Site URL**: `http://localhost:8081` (development) or your production domain
3. **Additional Redirect URLs**:
   - `http://localhost:8081/`
   - `http://localhost:8081/auth/callback`

## 🎨 What This Changes

**Before**: "Choose an account to continue to ezfbekvpmzykjniyyrof.supabase.co"
**After**: "Choose an account to continue to LushHeirLoom"

## 🔄 Additional Improvements Made in Code

Updated the Google OAuth request to include:
- `access_type: 'offline'` - For refresh tokens
- `prompt: 'consent'` - Ensures proper consent flow

## ⚠️ Important Notes

1. **OAuth Consent Screen Review**: If your app is in "Testing" mode in Google Cloud Console, only test users can sign in. For production, you'll need to submit for verification.

2. **Domain Verification**: For production, you'll need to verify ownership of your domain in Google Cloud Console.

3. **Cache Clear**: After making changes, clear browser cache or use incognito mode to test.

## 🧪 Testing Steps

1. Make the above changes in Google Cloud Console
2. Update Supabase settings
3. Wait 5-10 minutes for changes to propagate
4. Test at: http://localhost:8081/signin
5. Click "Continue with Google"
6. Should now show "LushHeirLoom" instead of Supabase URL

## 🚀 Pro Tips

- **Application Logo**: Upload your LushHeirLoom logo in Google Cloud Console OAuth consent screen for better branding
- **Brand Colors**: The consent screen will use your uploaded logo and brand colors
- **Verification**: For production, submit your app for Google verification to remove the "unverified app" warning

The main fix is updating the **Application name** in Google Cloud Console OAuth consent screen to "LushHeirLoom"!