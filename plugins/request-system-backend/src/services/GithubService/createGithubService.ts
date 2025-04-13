import { LoggerService, AuthService, HttpAuthService } from '@backstage/backend-plugin-api';
import { NotFoundError, InputError } from '@backstage/errors';
import { catalogServiceRef, CatalogServiceRequestOptions } from '@backstage/plugin-catalog-node';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import crypto from 'node:crypto';
import { GithubRepo, GithubService } from './types';
import { Request } from 'express';
import fetch from 'node-fetch';

// Annotation for GitHub repository
const GITHUB_REPO_ANNOTATION = 'github.com/project-slug';

// TEMPLATE NOTE:
// This is a simple in-memory Github repo store. It is recommended to use a
// database to store data in a real application. See the database service
// documentation for more information on how to do this:
// https://backstage.io/docs/backend-system/core-services/database
export async function createGithubService({
  logger,
  catalog,
  catalogApi,
  auth,
  httpAuth,
}: {
  logger: LoggerService;
  catalog: typeof catalogServiceRef.T;
  catalogApi: typeof catalogServiceRef.T;
  auth: AuthService;
  httpAuth: HttpAuthService;
}): Promise<GithubService> {
  logger.info('Initializing GithubService');

  // Initialize with some sample data for testing
  const storedRepos: GithubRepo[] = [];

  return {
    async createRepo(input, options) {
      let title = input.title;

      // TEMPLATE NOTE:
      // A common pattern for Backstage plugins is to pass an entity reference
      // from the frontend to then fetch the entire entity from the catalog in the
      // backend plugin.
      if (input.entityRef) {
        // TEMPLATE NOTE:
        // Cross-plugin communication uses service-to-service authentication. The
        // `AuthService` lets you generate a token that is valid for communication
        // with the target plugin only. You must also provide credentials for the
        // identity that you are making the request on behalf of.
        //
        // If you want to make a request using the plugin backend's own identity,
        // you can access it via the `auth.getOwnServiceCredentials()` method.
        // Beware that this bypasses any user permission checks.
        const entity = await catalog.getEntityByRef(input.entityRef, options);
        if (!entity) {
          throw new NotFoundError(
            `No entity found for ref '${input.entityRef}'`,
          );
        }

        // TEMPLATE NOTE:
        // Here you could read any form of data from the entity. A common use case
        // is to read the value of a custom annotation for your plugin. You can
        // read more about how to add custom annotations here:
        // https://backstage.io/docs/features/software-catalog/extending-the-model#adding-a-new-annotation
        //
        // In this example we just use the entity title to decorate the repo item.

        const entityDisplay = entity.metadata.title ?? input.entityRef;
        title = `[${entityDisplay}] ${input.title}`;
      }

      const id = crypto.randomUUID();
      const createdBy = options.credentials.principal.userEntityRef;
      const newRepo = {
        title,
        id,
        createdBy,
        createdAt: new Date().toISOString(),
      };

      storedRepos.push(newRepo);

      // TEMPLATE NOTE:
      // The second argument of the logger methods can be used to pass
      // structured metadata. You can read more about the logger service here:
      // https://backstage.io/docs/backend-system/core-services/logger
      logger.info('Created new Github repo', { id, title, createdBy });

      return newRepo;
    },

    async listRepos(request: Request, options: { token: string }): Promise<GithubRepo[]> {
      try {
        logger.info('Listing Github repositories');

        // Make direct call to catalog API endpoint
        const response = await fetch('http://localhost:7007/api/catalog/entities?filter=metadata.annotations.github.com%2Fproject-slug', {
          headers: {
            Authorization: `Bearer ${options.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch catalog entities: ${response.statusText}`);
        }

        // The response is a direct array of entities
        const entities = await response.json() as Entity[];
        logger.info('Received response from catalog API', { 
          entitiesCount: entities.length,
          firstEntityName: entities.length > 0 ? entities[0].metadata.name : 'none'
        });
        
        // Transform catalog entities to GithubRepo format
        const catalogRepos = Array.isArray(entities) ? entities.map(entity => mapEntityToRepo(entity)) : [];
        logger.info('Transformed catalog entities to repos', { 
          catalogReposCount: catalogRepos.length 
        });
        
        // Combine with any in-memory stored repos
        const allRepos = [...storedRepos, ...catalogRepos];
        logger.info('Combined repos', { 
          storedReposCount: storedRepos.length,
          catalogReposCount: catalogRepos.length,
          totalReposCount: allRepos.length
        });
        
        return allRepos;
      } catch (error) {
        logger.error('Error listing Github repositories', { error });
        throw new Error(`Failed to list Github repositories: ${error}`);
      }
    },

    async getRepo(request: { id: string }) {
      // First check in-memory storage
      const repo = storedRepos.find(item => item.id === request.id);
      if (repo) {
        return repo;
      }
      
      // If not found in memory, try to find by name in catalog
      try {
        // Using empty options object to avoid requiring credentials
        const entity = await catalog.getEntityByRef(request.id, {});
        if (entity) {
          return mapEntityToRepo(entity);
        }
      } catch (error) {
        logger.debug(`Entity not found with id '${request.id}'`, { error });
      }
      
      throw new NotFoundError(`No repo found with id '${request.id}'`);
    },
  };
}

// Helper function to map catalog entities to GithubRepo format
function mapEntityToRepo(entity: Entity): GithubRepo {
  // Extract GitHub repository information from annotations
  const repoSlug = entity.metadata.annotations?.[GITHUB_REPO_ANNOTATION] || '';
  
  const repo = {
    title: entity.metadata.title || entity.metadata.name,
    id: entity.metadata.name,
    createdBy: entity.spec?.owner || 'unknown',
    createdAt: entity.metadata.createdAt || new Date().toISOString(),
    // Add GitHub specific information
    repoUrl: repoSlug ? `https://github.com/${repoSlug}` : undefined,
    repoSlug,
  };
  
  // For debugging
  console.log('Mapped entity to repo:', { entity: entity.metadata.name, repo });
  
  return repo;
}
