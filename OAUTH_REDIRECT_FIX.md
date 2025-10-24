# 🚨 OAuth Redirect URL Fix - Port Mismatch Issue

## 🔍 Problem Identified
Your OAuth callback is redirecting to `localhost:3000` but your dev server runs on `localhost:8081`, causing:
- `ERR_CONNECTION_REFUSED` error
- Users not being created in Supabase
- Failed authentication flow

## 🎯 Root Cause
The OAuth redirect URLs are configured for the wrong port (3000 instead of 8081).

## 🔧 IMMEDIATE FIXES NEEDED:

### 1. Google Cloud Console - OAuth Client Redirect URIs

**Go to**: https://console.cloud.google.com/apis/credentials

**Edit your OAuth 2.0 Client ID and update Authorized redirect URIs:**

❌ **Remove if present**:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/`

✅ **Add these**:
- `http://localhost:8081/auth/callback`
- `http://localhost:8081/`
- `https://ezfbekvpmzykjniyyrof.supabase.co/auth/v1/callback`

### 2. Supabase Dashboard - Site URL Configuration

**Go to**: https://app.supabase.com/project/ezfbekvpmzykjniyyrof/auth/url-configuration

**Update Site URL**:
- ❌ Change FROM: `http://localhost:3000`
- ✅ Change TO: `http://localhost:8081`

**Additional Redirect URLs**:
- `http://localhost:8081/`
- `http://localhost:8081/auth/callback`

### 3. Verify Current Server Status
Your server is correctly running on: `http://localhost:8081/` ✅

## 🧪 Testing Steps After Fix:

1. **Clear browser cache** or use incognito mode
2. **Wait 5 minutes** for changes to propagate
3. **Go to**: http://localhost:8081/signin
4. **Click**: "Continue with Google"
5. **Should redirect properly** after authentication

## ⚠️ Important Notes:

- **Port 8081 is correct** - don't change your server port
- **Both Google and Supabase** need the same redirect URLs
- **Changes take 2-5 minutes** to propagate
- **Clear cache** to avoid old redirect behavior

## 🔍 How to Verify Fix:

After making changes, check:
1. **Google OAuth flow completes** without connection errors
2. **User gets redirected** to http://localhost:8081/ 
3. **New user appears** in Supabase Authentication → Users
4. **Header shows user name** when signed in

## 🚀 Expected Flow After Fix:

1. User clicks "Continue with Google"
2. Google authentication screen (shows "LushHeirLoom")
3. User grants permission
4. **Redirects to**: `http://localhost:8081/` ✅
5. User is signed in and appears in Supabase
6. Header shows user's Google name

The main issue is the **port mismatch** - fix the redirect URLs and it will work perfectly! 🎯