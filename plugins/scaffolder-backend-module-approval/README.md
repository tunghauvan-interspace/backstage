# @internal/plugin-scaffolder-backend-module-approval

The approval module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

## Overview

This module provides an approval action for the Backstage Scaffolder that allows templates to pause execution until required approvals are received.

## Usage

The approval action can be used in templates to implement approval workflows. It pauses template execution until specific users or groups approve the operation.

### Example Template

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: example-with-approval
  title: Example with Approval
spec:
  steps:
    # Initial setup steps
    - id: fetch-base
      name: Fetch Base
      action: fetch:template
      input:
        url: ./templates/service
        values:
          name: ${{ parameters.name }}
          owner: ${{ parameters.owner }}
          
    # Request approval before proceeding
    - id: request-approval
      name: Request Approval
      action: scaffolder:approval
      input:
        title: Approve new service creation
        description: |
          Please review and approve the creation of service "${{ parameters.name }}"
          Owner: ${{ parameters.owner }}
        approvers:
          - team-leads
          - operations
        minApprovals: 2
        timeoutInMinutes: 4320 # 3 days
        
    # Continue with remaining steps only if approved
    - id: publish
      name: Publish
      action: publish:github
      if: ${{ steps['request-approval'].output.approved }}
      input:
        repoUrl: ${{ parameters.repoUrl }}
```

## Integration

To use this module in your Backstage instance:

1. Add it as a dependency in your backend package:
```json
"dependencies": {
  "@internal/plugin-scaffolder-backend-module-approval": "workspace:^"
}
```

2. Import the module in your backend:
```typescript
backend.add(import('@internal/plugin-scaffolder-backend-module-approval'));
```

## Configuration

The approval action requires an approval service implementation. You'll need to create this service to handle the storage and retrieval of approval requests and decisions.

### Implementing the Approval Service

The approval service must implement:

1. `createRequest` - Stores a new approval request and returns its ID
2. `waitForDecision` - Waits for and returns the decision for a given request ID

See the module code for detailed interface requirements.
