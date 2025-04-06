# @internal/plugin-scaffolder-backend-module-example

The example module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

## Overview

This module demonstrates how to create and integrate custom actions for the Backstage Scaffolder. It includes an example action that shows how to use the action context object, which provides access to various utilities and services during template execution.

## The Context Object

When creating custom actions, the context object is a powerful tool that provides access to:

- `workspacePath`: The absolute path to the working directory containing the skeleton files
- `logger`: A logger instance scoped to the current action
- `logStream`: A stream that can be written to that will appear in the frontend
- `output`: A function to set outputs from the action
- `createTemporaryDirectory`: Function to create a temporary directory
- `input`: The input object containing parameters from the template
- `templateInfo`: Metadata about the template being executed

## Example Action Implementation

Here's how the context object is used in our example action:

```typescript
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fs from 'fs-extra';
import { resolveSafeChildPath } from '@backstage/backend-common';

export const createExampleAction = () => {
  return createTemplateAction<{
    name: string;
    description?: string;
  }>({
    id: 'acme:example',
    schema: {
      input: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            description: 'The name to use in the greeting',
          },
          description: {
            title: 'Description',
            type: 'string',
            description: 'Optional description',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          greeting: {
            title: 'Greeting',
            type: 'string',
            description: 'The generated greeting message',
          },
        },
      },
    },
    async handler(ctx) {
      // Access input parameters from the template
      const { name, description } = ctx.input;
      
      // Use the logger for debugging and operational information
      ctx.logger.info(`Processing example action for ${name}`);
      
      // Write to the log stream (visible to users in the UI)
      ctx.logStream.write(`Creating greeting for ${name}...\n`);
      
      // Create a file in the workspace directory
      if (description) {
        const targetPath = resolveSafeChildPath(ctx.workspacePath, 'greeting.txt');
        await fs.writeFile(targetPath, `Hello ${name}!\n\n${description}`);
        ctx.logStream.write(`Created greeting file at workspace\n`);
      }
      
      // Access template metadata if needed
      ctx.logger.debug(`Running as part of template: ${ctx.templateInfo?.entityRef || 'unknown'}`);
      
      // Create a temporary directory if needed
      const tempDir = await ctx.createTemporaryDirectory();
      ctx.logger.debug(`Created temp directory at ${tempDir}`);
      
      // Set outputs that can be consumed by other actions
      ctx.output('greeting', `Hello ${name}!`);
      ctx.logStream.write(`✅ Example action completed successfully\n`);
    },
  });
};
```

## Integration Steps

To integrate this module into your Backstage instance:

1. **The module is already included** as a dependency in your backend package:
   ```json
   // In packages/backend/package.json
   "dependencies": {
     "@internal/plugin-scaffolder-backend-module-example": "workspace:^"
   }
   ```

2. **The module is already imported** in your backend:
   ```typescript
   // In packages/backend/src/index.ts
   backend.add(import('@internal/plugin-scaffolder-backend-module-example'));
   ```

3. **Verify the module registration** by checking that:
   - The module is properly loaded on backend startup
   - No errors appear in logs related to this module
   - The action is available in the Scaffolder

## Using the Action in Templates

Once registered, you can use the action in your templates:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: example-template
  title: Example Template
spec:
  steps:
    - id: example-step
      name: Example
      action: acme:example
      input:
        name: ${{ parameters.name }}
        description: ${{ parameters.description }}
    
    # Use the output from the previous step
    - id: use-output
      name: Use Output
      action: debug:log
      input:
        message: ${{ steps['example-step'].output.greeting }}
```

## Action Context Object Reference

The context object provides these key capabilities:

| Property | Type | Purpose | Example |
|----------|------|---------|---------|
| `workspacePath` | `string` | Access the workspace directory | `fs.writeFile(path.join(ctx.workspacePath, 'file.txt'), 'content')` |
| `logger` | `Logger` | Log information | `ctx.logger.info('Processing...')` |
| `logStream` | `WritableStream` | Write to UI logs | `ctx.logStream.write('Working on task...\n')` |
| `output` | `function` | Set step outputs | `ctx.output('result', value)` |
| `createTemporaryDirectory` | `function` | Create temp directory | `const tmpDir = await ctx.createTemporaryDirectory()` |
| `input` | `object` | Access input parameters | `const { name } = ctx.input` |
| `templateInfo` | `object` | Get template metadata | `ctx.templateInfo?.entityRef` |

## Testing Custom Actions

You can test the action using the `@backstage/plugin-scaffolder-node-test-utils` package:

```typescript
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { createExampleAction } from './actions/example';

describe('example action', () => {
  it('should create greeting output', async () => {
    const action = createExampleAction();
    const context = createMockActionContext({
      input: { 
        name: 'Test User',
        description: 'This is a test'
      }
    });
    
    await action.handler(context);
    expect(context.output).toHaveBeenCalledWith('greeting', 'Hello Test User!');
  });
});
```

## Further Reading

For more information on writing custom actions, see:
- [Writing Custom Actions](https://backstage.io/docs/features/software-templates/writing-custom-actions)
- [The Context Object](https://backstage.io/docs/features/software-templates/writing-custom-actions#the-context-object)
- [Scaffolder Actions API Reference](https://backstage.io/docs/reference/plugin-scaffolder-node.scaffolderactionsextensionpoint)
