import {
  CacheService,
  HttpAuthService,
  errorHandler,
} from '@backstage/backend-common';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { GithubService } from '../services/GithubService/types';

export async function createRouter({
  github,
  httpAuth,
  catalog,
  cache,
}: {
  github: GithubService;
  httpAuth: HttpAuthService;
  catalog: typeof catalogServiceRef.T;
  cache: CacheService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  const requestBodySchema = z.object({
    title: z.string().min(1),
    entityRef: z.string().optional(),
  });

  router.post('/repos', async (request, response) => {
    const credentials = await httpAuth.credentials(request);

    const body = await requestBodySchema.parseAsync(request.body).catch(error => {
      throw new Error(`Request body is invalid: ${error}`);
    });

    const repo = await github.createRepo(body, { credentials });
    response.status(201).json(repo);
  });

  router.get('/repos', async (_, response) => {
    const repos = await github.listRepos();
    response.json(repos);
  });

  router.get('/repos/:id', async (request, response) => {
    const { id } = request.params;
    const repo = await github.getRepo({ id });
    response.json(repo);
  });

  router.get('/example', async (_, response) => {
    // TEMPLATE NOTE:
    // This example creates a cache that persists for the lifetime of the service.
    // In this case we're using a memory cache, but you could use any compatible
    // cache backend like memcache if you wanted.
    //
    // This example uses the `getOrCreate` method to get a cached value or create
    // it if it doesn't exist. In this case since we don't have any parameters
    // we'll only ever have one cached value. You could use the key parameter to
    // cache multiple values based on the input parameters though, for example
    // response data for different entity refs.
    const data = await cache.getOrCreate('example', {
      ttl: 30, // Cache up to 30 seconds
      async createFn() {
        const time = new Date().toISOString();

        return {
          time,
          authInfo: {
            message: `You can access this endpoint without authentication. The '/todos' endpoints require authentication, try it with a 'Bearer <token>' header`,
          },
        };
      },
    });

    response.json(data);
  });

  router.get('/user', async (request, response) => {
    // TEMPLATE NOTE:
    // This is an example of how to access the identity of the user making the
    // request. If not authenticated, this will throw.
    const credentials = await httpAuth.credentials(request);
    const identity: BackstageIdentityResponse = {
      ...credentials.principal,
      identity: credentials.principal,
    };
    response.json(identity);
  });

  router.use(errorHandler());
  return router;
}