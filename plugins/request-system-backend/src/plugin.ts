import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './service/router';
import { createGithubService } from './services/GithubService';
import { AuthService, HttpAuthService, CacheService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';

/**
 * The request-system backend plugin.
 *
 * @public
 */
export const requestSystemPlugin = createBackendPlugin({
  pluginId: 'request-system',
  register(env) {
    env.registerInit({
      deps: {
        cache: coreServices.cache,
        permissions: coreServices.permissions,
        httpAuth: coreServices.httpAuth,
        http: coreServices.httpRouter,
        auth: coreServices.auth,
        logger: coreServices.logger,
        catalog: catalogServiceRef,
        catalogApi: catalogServiceRef,
        config: coreServices.rootConfig,
      },
      async init({ cache, httpAuth, http, logger, catalog, auth , catalogApi, config}) {
        const github = await createGithubService({
          logger,
          catalog,
          httpAuth,
          auth,
          catalogApi: catalogApi,
          config,
        });
        http.use(
          await createRouter({
            github,
            httpAuth,
            catalog,
            auth,
            cache,
            catalogApi: catalogApi,
          }),
        );
      },
    });
  },
});
