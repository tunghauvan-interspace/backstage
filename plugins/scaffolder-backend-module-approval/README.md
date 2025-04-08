# @internal/plugin-scaffolder-backend-module-approval

The approval module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

This module adds a `scaffolder:request` action to the scaffolder that allows templates to request approval from specified approvers before proceeding with the rest of the template steps.

## Installation

1. Install the package:
```bash
# From your Backstage root directory
yarn add --cwd packages/backend @internal/plugin-scaffolder-backend-module-approval
```

2. Add the module to your backend:
```typescript
// In packages/backend/src/index.ts
backend.add(import('@internal/plugin-scaffolder-backend-module-approval'));
```

## Usage in Templates

You can use the `scaffolder:request` action in your templates to request approval before proceeding:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-service-with-approval
  title: Create Service with Approval
  description: Creates a new service after approval from owners
spec:
  owner: team-a
  type: service
  parameters:
    # your template parameters here
  steps:
    - id: createInitialStructure
      name: Create Initial Project Structure
      action: fetch:template
      input:
        url: ./skeleton
        values:
          name: ${{ parameters.name }}
          # other values
          
    - id: requestApproval
      name: Request Approval
      action: scaffolder:request
      input:
        title: "Approve creation of service ${{ parameters.name }}"
        description: "Please review and approve the creation of the new service ${{ parameters.name }}"
        approvers:
          - user:default/team-lead
        # Optional: override the API base URL if needed
        baseUrl: "https://backstage.example.com/api/approval"
          
    - id: publish
      name: Publish Repository
      if: ${{ steps.requestApproval.output.approved }}
      action: publish:github
      input:
        repoUrl: ${{ parameters.repoUrl }}
        # other inputs
        
    - id: register
      name: Register in Catalog
      if: ${{ steps.requestApproval.output.approved }}
      action: catalog:register
      input:
        catalogInfoPath: "/catalog-info.yaml"
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
```

## Action Inputs

The `scaffolder:request` action accepts the following inputs:

- `title` (required): The title of the approval request
- `description` (required): Detailed description of what needs approval
- `approvers` (required): List of approver user references or emails
- `baseUrl` (optional): Base URL for the approval API (default: http://localhost:7007/api/approval)

## Action Outputs

The action produces the following outputs:

- `approved` (boolean): Whether the request was approved (`true`) or rejected (`false`)
- `requestId` (string): The ID of the approval request

## Dependencies

This action requires the `@internal/plugin-approval-backend` plugin to be installed and configured in your Backstage instance.
