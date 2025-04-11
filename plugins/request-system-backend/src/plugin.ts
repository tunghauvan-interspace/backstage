import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './service/router';
import { createGithubService } from './services/GithubService';

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
        logger: coreServices.logger,
        catalog: catalogServiceRef,
      },
      async init({ cache, httpAuth, http, logger, catalog }) {
        const github = await createGithubService({
          logger,
          catalog,
        });
        http.use(
          await createRouter({
            github,
            httpAuth,
            catalog,
            cache,
          }),
        );
      },
    });
  },
});
