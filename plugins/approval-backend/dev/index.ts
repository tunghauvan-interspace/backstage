import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// This is the development setup for your plugin that wires up a
// minimal backend that can use both real and mocked plugins and services.
//
// Start up the backend by running `yarn start` in the package directory.
// Once it's up and running, try out the following requests:
//
// Create a new approval request, standalone or for the sample component:
//
//   curl http://localhost:7007/api/approval/approvals -H 'Content-Type: application/json' -d '{"title": "My Approval Request"}'
//   curl http://localhost:7007/api/approval/approvals -H 'Content-Type: application/json' -d '{"title": "My Approval Request", "entityRef": "component:default/sample"}'
//
// List approval requests:
//
//   curl http://localhost:7007/api/approval/approvals
//
// Get a specific approval request (replace <id> with an actual ID):
//
//   curl http://localhost:7007/api/approval/approvals/<id>
//
// Update an approval status (replace <id> with an actual ID):
//
//   curl -X PUT http://localhost:7007/api/approval/approvals/<id>/status -H 'Content-Type: application/json' -d '{"status": "approved", "comment": "Looks good!"}'
//
// Explicitly make an unauthenticated request, or with service auth:
//
//   curl http://localhost:7007/api/approval/approvals -H 'Authorization: Bearer mock-none-token'
//   curl http://localhost:7007/api/approval/approvals -H 'Authorization: Bearer mock-service-token'

const backend = createBackend();

// Mocking the auth and httpAuth service allows you to call your plugin API without
// having to authenticate.
backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());

// Rather than using a real catalog you can use a mock with a fixed set of entities.
backend.add(
  catalogServiceMock.factory({
    entities: [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'sample',
          title: 'Sample Component',
        },
        spec: {
          type: 'service',
        },
      },
    ],
  }),
);

backend.add(import('../src'));

backend.start();
