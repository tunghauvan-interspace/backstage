# GitHub Authentication Setup for Backstage

This guide will help you set up GitHub authentication for your Backstage application.

## 1. Create a GitHub OAuth App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "OAuth Apps" > "New OAuth App"
3. Fill in the following details:
   - **Application name**: Your Backstage App Name
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:7007/api/auth/github/handler/frame
4. Click "Register application"
5. Generate a new client secret
6. Note down the Client ID and Client Secret

## 2. Configure Environment Variables

1. Create or update your `.env` file in the root of your Backstage project with:

```
# GitHub OAuth credentials
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
```

2. Make sure the values match the Client ID and Client Secret from your GitHub OAuth App.
3. Verify your environment variables are loading correctly:

```bash
# Run this to check if environment variables are set
yarn check-env
```

## 3. Verify Configuration Files

1. Ensure your `app-config.yaml` has the correct GitHub auth provider configuration:

```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        callbackUrl: http://localhost:7007/api/auth/github/handler/frame
    guest: {}
```

2. Keep your `app-config.local.yaml` simple:

```yaml
auth:
  environment: development

backend:
  logging:
    level: debug
```

## 4. Start Backstage

1. Make sure your `.env` file is in the root directory
2. Use the environment-aware start command:

```bash
# Option 1: Using the helper script
node scripts/start-with-env.js

# Option 2: Using yarn directly with environment preload
yarn dev:env
```

## 5. Test Authentication

1. Open your Backstage app at http://localhost:3000
2. Click on the "Sign In" button
3. Select "GitHub" from the sign-in options
4. You should be redirected to GitHub for authentication
5. After authenticating, you'll be redirected back to Backstage

## 6. User Resolution

1. To resolve the authenticated user, ensure your `app-config.yaml` includes the following:

```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        callbackUrl: http://localhost:7007/api/auth/github/handler/frame
        userResolver:
          resolver: default
    guest: {}
```

2. This configuration will use the default user resolver to map the authenticated GitHub user to a Backstage user.

## Troubleshooting

### Common Issues:

1. **"Auth provider registered for 'github' is misconfigured"**:
   - Check the backend console logs - look for "Environment check:" output
   - If AUTH_GITHUB_CLIENT_ID exists: false is shown, the environment variables aren't loading
   - Try starting with `node scripts/start-with-env.js` which explicitly loads environment variables
   - Make sure your `.env` file is in the project root (same level as package.json)
   - Try restarting your terminal to ensure environment changes take effect

2. **Environment Variables Not Loading**:
   - Format must be exactly: `AUTH_GITHUB_CLIENT_ID=value` (no spaces, no quotes)
   - Run `yarn check-env` to diagnose problems with your .env file
   - Try setting variables directly in your terminal:
     ```bash
     # Windows CMD
     set AUTH_GITHUB_CLIENT_ID=your-id
     set AUTH_GITHUB_CLIENT_SECRET=your-secret
     yarn dev
     
     # PowerShell
     $env:AUTH_GITHUB_CLIENT_ID="your-id"
     $env:AUTH_GITHUB_CLIENT_SECRET="your-secret" 
     yarn dev
     
     # Linux/Mac
     AUTH_GITHUB_CLIENT_ID=your-id AUTH_GITHUB_CLIENT_SECRET=your-secret yarn dev
     ```

3. **GitHub Auth Redirection Issues**:
   - Verify your callback URL in GitHub OAuth app exactly matches: `http://localhost:7007/api/auth/github/handler/frame`
   - Check browser console for CORS or other errors
   - Ensure you're using the correct protocol (http vs https)

4. **Last Resort Solutions**:
   - As a temporary solution, you can hardcode the values directly in app-config.local.yaml (not recommended for production)
   - Try clearing browser cookies/cache and restarting both frontend and backend
   - Check that your GitHub app is properly configured and the OAuth app is active