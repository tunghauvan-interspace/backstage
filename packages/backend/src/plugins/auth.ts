import { createRouter } from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  createGithubProvider,
  getDefaultOwnerProcessor,
  GithubSignInResolver,
  githubUserIdSignInResolver,
  providers,
} from '@backstage/plugin-auth-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      github: createGithubProvider({
        // Auth provider configuration
        authHandler: {
          // Configure cache settings for authentication responses
          cache: {
            // Set cache TTL in seconds
            ttl: 3600,
          },
        },
        signIn: {
          resolver: async (info, ctx) => {
            // Customize the resolver to match your GitHub username to a user entity in the catalog
            const { fullProfile } = info.result;
            const userId = fullProfile.username || fullProfile.displayName;
            
            if (!userId) {
              throw new Error('GitHub user has no username or displayName');
            }

            // Return a reference to the entity
            return ctx.signInWithCatalogUser({
              entityRef: {
                name: userId,
              },
            });
          },
        },
      }),
      guest: providers.guest.create({
        // Add guest provider settings if needed
      }),
    },
  });
}
