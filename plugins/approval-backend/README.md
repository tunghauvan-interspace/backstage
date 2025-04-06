# approval

This plugin backend was templated using the Backstage CLI. You should replace this text with a description of your plugin backend.

## Installation

This plugin is installed via the `@internal/plugin-approval-backend` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @internal/plugin-approval-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@internal/plugin-approval-backend'));
```

## API Endpoints

The approval plugin provides the following API endpoints:

### Create a new approval request

```
POST /api/approval/approvals
```

Request body:
```json
{
  "title": "Approve my new service",
  "entityRef": "component:default/my-service" // optional
}
```

Response:
```json
{
  "id": "uuid",
  "title": "[My Service] Approve my new service",
  "status": "pending",
  "entityRef": "component:default/my-service",
  "createdBy": "user:default/john.doe",
  "createdAt": "2023-07-25T12:34:56.789Z"
}
```

### List all approval requests

```
GET /api/approval/approvals
```

Response:
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "[My Service] Approve my new service",
      "status": "pending",
      "entityRef": "component:default/my-service",
      "createdBy": "user:default/john.doe",
      "createdAt": "2023-07-25T12:34:56.789Z"
    }
  ]
}
```

### Get a specific approval request

```
GET /api/approval/approvals/:id
```

Response:
```json
{
  "id": "uuid",
  "title": "[My Service] Approve my new service",
  "status": "pending",
  "entityRef": "component:default/my-service",
  "createdBy": "user:default/john.doe",
  "createdAt": "2023-07-25T12:34:56.789Z"
}
```

### Update an approval status

```
PUT /api/approval/approvals/:id/status
```

Request body:
```json
{
  "status": "approved", // or "rejected"
  "comment": "Looks good!" // optional
}
```

Response:
```json
{
  "id": "uuid",
  "title": "[My Service] Approve my new service",
  "status": "approved",
  "entityRef": "component:default/my-service",
  "createdBy": "user:default/john.doe",
  "createdAt": "2023-07-25T12:34:56.789Z",
  "updatedBy": "user:default/jane.smith",
  "updatedAt": "2023-07-26T10:11:12.345Z",
  "comment": "Looks good!"
}
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn dev` from the root directory.
