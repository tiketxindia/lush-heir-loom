# Environment Variables Security Guide

## Overview
This project uses environment variables to securely store sensitive information like API keys and database credentials. This document explains how to set up and manage these variables properly.

## Required Environment Variables

### Frontend Variables (VITE_*)
These variables are exposed to the browser and should only contain public keys:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_key
```

### Backend/Script Variables
These variables are used by Node.js scripts and MCP server:

```bash
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_REF=your_supabase_project_reference
```

## Setup Instructions

### 1. Create Environment File
Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Get Your Supabase Credentials

#### Supabase URL and Anonymous Key
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

#### Supabase Access Token
1. Go to https://app.supabase.com/account/tokens
2. Generate a new access token
3. Copy it for `SUPABASE_ACCESS_TOKEN`

#### Project Reference
1. From your project URL: `https://[PROJECT_REF].supabase.co`
2. Extract the PROJECT_REF part for `SUPABASE_PROJECT_REF`

### 3. Update Your .env File
Fill in your actual values in the `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# MCP Server Configuration
SUPABASE_ACCESS_TOKEN=your_actual_access_token_here
SUPABASE_PROJECT_REF=your_project_ref_here
```

## Security Best Practices

### ✅ DO
- Keep `.env` files in `.gitignore`
- Use different keys for development/production
- Rotate access tokens regularly
- Only share public keys (anon keys) in frontend code
- Use environment-specific configuration

### ❌ DON'T
- Commit `.env` files to version control
- Share access tokens publicly
- Hardcode secrets in source code
- Use production keys in development

## File Structure

```
project/
├── .env                 # Your actual secrets (git-ignored)
├── .env.example         # Template with placeholder values
├── .gitignore           # Ensures .env is not committed
└── src/
    └── lib/
        └── supabase.ts  # Uses environment variables
```

## Deployment

### Vercel
1. Go to your project settings
2. Add environment variables in the "Environment Variables" section
3. Add each variable with appropriate scope (Development/Preview/Production)

### Netlify
1. Go to Site settings > Environment variables
2. Add each variable as a key-value pair

### Other Platforms
Consult your hosting provider's documentation for setting environment variables.

## Troubleshooting

### Common Issues

1. **"Missing environment variables" error**
   - Ensure your `.env` file exists
   - Check variable names match exactly (including VITE_ prefix)
   - Restart development server after changes

2. **Variables not updating**
   - Restart the development server
   - Clear browser cache
   - Check for typos in variable names

3. **Build/deployment issues**
   - Verify environment variables are set in deployment platform
   - Check that VITE_ variables are properly prefixed
   - Ensure no spaces around = in variable definitions

### Validation
The application will show clear error messages if required environment variables are missing.

## Scripts and Environment Variables

The following scripts automatically load environment variables:
- `test-setup.js`
- `setup-complete.js`
- `debug-auth.js`
- `test-complete.js`
- `fix-rls.js`

These scripts use the `dotenv` package to load variables from your `.env` file.

## MCP Server Configuration

The MCP server configuration in `.vscode/mcp.json` uses environment variable substitution:

```json
{
  "servers": {
    "supabase": {
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}",
        "SUPABASE_PROJECT_REF": "${SUPABASE_PROJECT_REF}"
      }
    }
  }
}
```

This ensures no secrets are hardcoded in the MCP configuration file.