/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { LoggerService } from '@backstage/backend-plugin-api';
import * as path from 'path';

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Import the admin permission policy
import { AdminPermissionPolicy } from './plugins/permission-policy';

import auth from './plugins/auth';

// Create a backend instance with more explicit logging for auth
const backend = createBackend({
  services: [
    {
      service: LoggerService,
      config: {
        format: 'text',
        baseOptions: {
          level: process.env.LOG_LEVEL || 'debug',
        },
      },
    },
  ],
});

// Log environment variables at startup to help debug authentication issues
console.log('Environment check:');
console.log(`AUTH_GITHUB_CLIENT_ID exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_ID)}`);
console.log(`AUTH_GITHUB_CLIENT_SECRET exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_SECRET)}`);

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// Add scaffolder backend and its required modules
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

// Register the example module to demonstrate custom actions with context object
// This provides access to:
// - workspacePath: Work directory for template files
// - logger: For logging information
// - logStream: For user-facing logs
// - output: To set outputs from actions
// - input: To receive inputs from templates
// - createTemporaryDirectory: For temp file operations
backend.add(import('@internal/plugin-scaffolder-backend-module-example'));

// Register the approval module to enable approval workflows in templates
backend.add(import('@internal/plugin-scaffolder-backend-module-approval'));

// Add other backend plugins
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// This is the module mentioned in the error message
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// search plugin
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

// Jenkins plugin
backend.add(import('@backstage-community/plugin-jenkins-backend'));

// SonarQube plugin
backend.add(import('@backstage-community/plugin-sonarqube-backend'));

// GitHub Pull Requests plugin
// backend.add(import('@backstage/plugin-github-pull-requests-backend'));

function makeCreateEnv(config: Config) {
  // ...existing code...
}

async function main() {
  // ...existing code...

  // Add a startup hook to execute code on application startup
  const startupHook = async () => {
    logger.info('Executing startup hook...');
    
    // Add your startup logic here
    // Examples:
    // - Initialize connections to external services
    // - Perform data migrations
    // - Set up recurring tasks
    // - Load initial configuration
    
    logger.info('Startup hook completed successfully');
  };

  // Register the startup hook
  await startupHook();

  const authEnv = useHotMemoize(module, () => createEnv('auth'));
  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));
  const sonarqubeEnv = useHotMemoize(module, () => createEnv('sonarqube'));
  // ...other env declarations...

  // ...existing code...

  const apiRouter = Router();
  apiRouter.use('/auth', await auth(authEnv));
  apiRouter.use('/catalog', await catalog(catalogEnv));
  apiRouter.use('/sonarqube', await sonarqube(sonarqubeEnv));
  // ...other routers...

  // ...existing code...
}

backend.start();
