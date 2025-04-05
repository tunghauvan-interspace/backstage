# GitHub App Setup for Backstage

This guide walks you through setting up a GitHub App for your Backstage instance to enable repository integration and authentication.

## 1. Create a GitHub App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "GitHub Apps" > "New GitHub App"
3. Fill in the following details:
   - **GitHub App name**: `Backstage-[Your Company Name]` (must be unique on GitHub)
   - **Homepage URL**: `http://localhost:3000` (or your production Backstage URL)
   - **User authorization callback URL**: `http://localhost:7007/api/auth/github/handler/frame`
   - **Webhook URL**: Leave blank if not using webhooks initially
   - **Webhook secret**: Generate a secure random string if using webhooks

4. Permissions needed:
   - Repository permissions:
     - **Contents**: Read
     - **Metadata**: Read
     - **Pull requests**: Read & Write (if using scaffolder)
   - Organization permissions:
     - **Members**: Read
   - User permissions:
     - **Email addresses**: Read

5. Where can this GitHub App be installed? 
   - Choose "Any account" for general use or "Only on this account" for internal use

6. Click "Create GitHub App"

## 2. Generate Private Key and Install App

1. After creating the app, click "Generate a private key" and save the downloaded file
2. Note your GitHub App ID displayed on the app settings page
3. Click "Install App" and select the organizations/repositories where you want to use Backstage

## 3. Configure Backstage for GitHub App

1. Create or update your `.env` file with:

```
# GitHub App credentials
GITHUB_APP_ID=your-app-id
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/your/private-key.pem
# Or use the key directly (replace newlines with \n)
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n"
# For GitHub authentication
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
```

2. Update your `app-config.yaml` with GitHub App configuration:

```yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${GITHUB_APP_ID}
          privateKey: ${GITHUB_APP_PRIVATE_KEY}
          # Or use file path
          # privateKeyPath: ${GITHUB_APP_PRIVATE_KEY_PATH}
          clientId: ${AUTH_GITHUB_CLIENT_ID}
          clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
          webhookSecret: ${GITHUB_WEBHOOK_SECRET} # Optional

auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        callbackUrl: http://localhost:7007/api/auth/github/handler/frame
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
        # Add this to ensure private repository access
        privateRepoAccess: true
```

## 4. Update Catalog Configuration

Add or update your catalog configuration to use GitHub integration:

```yaml
catalog:
  import:
    entityFilename: catalog-info.yaml
    pullRequestBranchName: backstage-integration
  rules:
    - allow: [Component, System, API, Resource, Location, User, Group]
  
  # GitHub organization integration
  providers:
    github:
      organization:
        name: your-organization-name
        configRefreshIntervalMs: 300000 # 5 minutes
```

## 5. Create User Mapping

Ensure your GitHub users can be properly identified in Backstage by adding them to your organization file:

```yaml
# examples/users.yaml
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: github-username  # Use your GitHub username
spec:
  profile:
    displayName: Your Full Name
    email: your.email@example.com
  memberOf: [team-name]
```

## 6. Start Backstage with Environment Variables

```bash
# Using the helper script
node scripts/start-with-env.js

# Or directly with environment preload
yarn dev:env
```

## Troubleshooting

### Common Issues:

1. **Authentication Errors**:
   - Verify your callback URL exactly matches what's in your GitHub App settings
   - Check environment variables are properly loaded
   - Inspect browser network requests for detailed error messages

2. **Repository Access Issues**:
   - Ensure the GitHub App is installed on all repositories you need to access
   - Verify the App has sufficient permissions (may need to update permissions and reinstall)
   - Check if the authenticated user has access to the repositories

3. **Private Key Format Problems**:
   - When using `GITHUB_APP_PRIVATE_KEY` environment variable, make sure newlines are replaced with `\n`
   - Alternatively, use `privateKeyPath` to point to the PEM file directly

4. **Debugging Tools**:
   - Enable debug logging in Backstage by setting `backend.logging.level: debug` in your `app-config.local.yaml`
   - Check browser console and Backstage backend logs for error messages
   - Use GitHub's developer settings to inspect recent deliveries for webhooks

## Additional Resources

- [Backstage GitHub Integration Documentation](https://backstage.io/docs/integrations/github/locations)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps/building-github-apps)
- [Configuring Sign-in Resolvers](https://backstage.io/docs/auth/identity-resolver)
