# Writing Custom Actions

The Scaffolder is powered by Tasks, which are in turn powered by Actions. When a Template is executed, a Task is created and each step in the Template is executed in sequence, with the actions being the implementation of these steps. This allows for customization of the Templates by writing custom actions. This guide demonstrates how to write custom actions and add them to the Backstage scaffolder.

## Creating a Custom Action

### Project Structure

The following is an example project structure for creating a custom action:

```
.
├── package.json
└── src
    └── actions
        ├── index.ts
        └── my-custom-action.ts
```

### Implementation

Here's how to implement a basic custom action:

```typescript
// src/actions/my-custom-action.ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const myCustomAction = () => {
  return createTemplateAction({
    id: 'mycompany:my-custom-action',
    schema: {
      input: {
        required: ['foo'],
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            title: 'Foo',
            description: 'An example input.',
          },
        },
      },
    },
    async handler(ctx) {
      const { foo } = ctx.input;
      ctx.logger.info(`Running my custom action with foo: ${foo}`);
    },
  });
};
```

### Exporting the Action

Make sure to export the action from your package:

```typescript
// src/actions/index.ts
export { myCustomAction } from './my-custom-action';
```

## Using Context

When writing a custom action, the `context` or `ctx` object provides several useful properties and methods:

- `ctx.logger`: Logging utility
- `ctx.workspacePath`: The path to the workspace directory
- `ctx.input`: The input parameters provided by the template
- `ctx.output`: The output object to set outputs for later steps
- `ctx.createTemporaryDirectory()`: Create a temporary directory

## Registering Custom Actions

To use your custom actions in Backstage, you need to register them with the scaffolder:

```typescript
// packages/backend/src/plugins/scaffolder.ts
import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { myCustomAction } from 'my-action-package';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    catalogClient,
    reader: env.reader,
    actions: [
      // built-in actions
      createBuiltinActions({
        catalogClient,
        integrations: ScmIntegrations.fromConfig(env.config),
        config: env.config,
        reader: env.reader,
      }),
      // your custom action
      myCustomAction(),
    ],
  });
}
```

## Examples

### Working with Files

```typescript
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fs from 'fs-extra';
import path from 'path';

export const createFileAction = () => {
  return createTemplateAction({
    id: 'mycompany:file:create',
    schema: {
      input: {
        required: ['contents', 'filename'],
        type: 'object',
        properties: {
          contents: {
            type: 'string',
            title: 'Contents',
            description: 'The contents of the file',
          },
          filename: {
            type: 'string',
            title: 'Filename',
            description: 'The filename of the file that will be created',
          },
        },
      },
    },
    async handler(ctx) {
      const { filename, contents } = ctx.input;
      await fs.writeFile(path.join(ctx.workspacePath, filename), contents);
    },
  });
};
```

### Making API Calls

```typescript
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fetch from 'node-fetch';

export const makeApiCallAction = () => {
  return createTemplateAction({
    id: 'mycompany:api:call',
    schema: {
      input: {
        required: ['apiUrl'],
        type: 'object',
        properties: {
          apiUrl: {
            type: 'string',
            title: 'API URL',
            description: 'The URL of the API to call',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          response: {
            type: 'object',
            title: 'Response',
          },
        },
      },
    },
    async handler(ctx) {
      const { apiUrl } = ctx.input;
      const response = await fetch(apiUrl);
      const data = await response.json();
      ctx.output('response', data);
    },
  });
};
```

## Setting Outputs

Custom actions can produce outputs that can be used in subsequent steps:

```typescript
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const outputAction = () => {
  return createTemplateAction({
    id: 'mycompany:output:example',
    schema: {
      input: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          greeting: {
            type: 'string',
            title: 'Greeting',
          },
        },
      },
    },
    async handler(ctx) {
      const { name } = ctx.input;
      ctx.output('greeting', `Hello, ${name}!`);
    },
  });
};
```

Using the output in a later step:

```yaml
steps:
  - id: output-step
    name: Output Example
    action: mycompany:output:example
    input:
      name: World
  
  - id: use-output-step
    name: Use Output
    action: debug:log
    input:
      message: ${{ steps['output-step'].output.greeting }}
```

## Best Practices

1. **Always validate inputs**: Use the JSON schema to validate inputs and provide meaningful error messages.
2. **Use namespaced IDs**: Prefix your action IDs with a namespace (e.g., `mycompany:`) to avoid conflicts.
3. **Provide good documentation**: Document what your action does, what inputs it requires, and what outputs it produces.
4. **Handle errors gracefully**: Use try/catch blocks and provide meaningful error messages.
5. **Use the logger**: Use the provided logger for consistent logging.
6. **Clean up temporary resources**: Make sure to clean up any temporary resources created by your action.

## Testing Custom Actions

You can write tests for your custom actions using Jest:

```typescript
import { myCustomAction } from './my-custom-action';
import mockFs from 'mock-fs';

describe('myCustomAction', () => {
  const mockContext = {
    logger: { info: jest.fn() },
    workspacePath: '/tmp/mock-workspace',
    input: { foo: 'bar' },
    output: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockFs({
      '/tmp/mock-workspace': {},
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should log the input value', async () => {
    const action = myCustomAction();
    await action.handler(mockContext);
    expect(mockContext.logger.info).toHaveBeenCalledWith('Running my custom action with foo: bar');
  });
});
```

## Conclusion

Custom actions are a powerful way to extend the Backstage scaffolder to fit your organization's specific needs. By following this guide, you should be able to create and register custom actions that can be used in your templates.
