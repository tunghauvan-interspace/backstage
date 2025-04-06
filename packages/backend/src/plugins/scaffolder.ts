import { CatalogClient } from '@backstage/catalog-client';
import { createApprovalAction } from './scaffolder/actions/approval';

export default async function createPlugin({
  logger,
  config,
  database,
  reader,
  discovery,
  tasks,
}: PluginEnvironment): Promise<Router> {
  const catalogClient = new CatalogClient({ discoveryApi: discovery });
  
  const actions = [
    createApprovalAction(),
  ];
  
  return await createRouter({
    logger,
    config,
    database,
    catalogClient,
    reader,
    actions,
  });
}