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

1. Add the following to your `.env` file:

```
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 3. Start Backstage

1. Make sure your `.env` file is in the root directory of your Backstage project
2. Start Backstage with:

```
yarn dev
```

## 4. Test Authentication

1. Open your Backstage app at http://localhost:3000
2. Click on the "Sign In" button
3. Select "GitHub" from the sign-in options
4. You should be redirected to GitHub for authentication
5. After authenticating, you'll be redirected back to Backstage

## Troubleshooting

- If you encounter issues, check the backend logs for error messages
- Verify that your OAuth callback URL is correctly configured
- Ensure that your environment variables are properly set
- Make sure the GitHub OAuth app is properly configured