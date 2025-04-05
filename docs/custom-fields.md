# Writing Custom Field Extensions

The Backstage Software Templates feature allows for customizing the form fields that are used when users fill in the template parameters. This is done through custom field extensions, which allow you to create specialized form fields for your templates.

## Creating a Custom Field Extension

A field extension is a React component that gets rendered in the form, and it needs to adhere to the `FieldExtensionComponent` type.

### Basic Structure

```tsx
import React from 'react';
import { FieldExtensionComponent } from '@backstage/plugin-scaffolder-react';

export const CustomFieldExtension: FieldExtensionComponent<
  { customFieldProp1: string; customFieldProp2: number },
  string
> = ({ onChange, rawErrors, required, disabled, schema: { title, description }, uiSchema, formData }) => {
  // Your custom field implementation
  return (
    <div>
      <label>{title}</label>
      <input
        type="text"
        value={formData || ''}
        onChange={e => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      />
      {rawErrors?.map(error => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
};
```

### Field Extension Schema

Field extensions use a schema to define their properties and validation rules:

```tsx
export const CustomFieldSchema = {
  uiOptions: {
    customFieldProp1: {
      type: 'string',
    },
    customFieldProp2: {
      type: 'number',
    },
  },
};
```

## Registering Custom Field Extensions

To use your custom field extension in templates, you need to register it with the Scaffolder.

### In your app-config

```yaml
# app-config.yaml
app:
  extensions:
    - import: '@backstage/plugin-scaffolder'
      install:
        - fieldExtensions:
            - id: CustomField
              component: '@internal/path-to-your-field-extension#CustomFieldExtension'
              schema: '@internal/path-to-your-field-extension#CustomFieldSchema'
```

### Using code registration

```tsx
// packages/app/src/scaffolder.tsx
import {
  scaffolderPlugin,
  createScaffolderFieldExtension,
} from '@backstage/plugin-scaffolder';
import { CustomFieldExtension, CustomFieldSchema } from '../path/to/your/field/extension';

export const ScaffolderPage = () => {
  const customFieldExtension = createScaffolderFieldExtension({
    name: 'CustomField',
    component: CustomFieldExtension,
    schema: CustomFieldSchema,
  });

  return (
    <ScaffolderPageProvider
      extensions={[customFieldExtension]}
    >
      {/* Page content */}
    </ScaffolderPageProvider>
  );
};
```

## Using Custom Field Extensions

Once registered, you can use your custom field in template schemas:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: example-template
  title: Example Template
spec:
  parameters:
    - title: Fill in some steps
      properties:
        customField:
          title: Custom Field
          type: string
          ui:field: CustomField
          ui:options:
            customFieldProp1: 'value1'
            customFieldProp2: 42
```

## Examples

### RepoUrlPicker

This is a built-in field extension that allows users to pick a repository URL:

```tsx
import { RepoUrlPickerFieldExtension } from '@backstage/plugin-scaffolder';

// In your registration
const repoUrlPickerExtension = createScaffolderFieldExtension({
  name: 'RepoUrlPicker',
  component: RepoUrlPickerFieldExtension,
  schema: {},
});
```

Using in a template:

```yaml
properties:
  repoUrl:
    title: Repository Location
    type: string
    ui:field: RepoUrlPicker
```

### Owner Picker

A custom field to select an owner from the catalog:

```tsx
import React from 'react';
import { FieldExtensionComponent } from '@backstage/plugin-scaffolder-react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

export const OwnerPickerExtension: FieldExtensionComponent<{}, string> = ({
  onChange,
  formData,
}) => {
  const catalogApi = useApi(catalogApiRef);
  const [owners, setOwners] = React.useState<Array<{ name: string; title: string }>>([]);

  React.useEffect(() => {
    catalogApi.getEntities({
      filter: { kind: 'Group' },
    }).then(result => {
      setOwners(result.items.map(item => ({
        name: item.metadata.name,
        title: item.metadata.title || item.metadata.name,
      })));
    });
  }, [catalogApi]);

  return (
    <select
      value={formData || ''}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">-- Select an owner --</option>
      {owners.map(owner => (
        <option key={owner.name} value={owner.name}>
          {owner.title}
        </option>
      ))}
    </select>
  );
};
```

## Accessing Context and APIs

Custom fields can access Backstage APIs and context:

```tsx
import { useApi } from '@backstage/core-plugin-api';
import { scaffolderApiRef } from '@backstage/plugin-scaffolder-react';

const CustomFieldWithApi: FieldExtensionComponent<{}, string> = ({ onChange }) => {
  const scaffolderApi = useApi(scaffolderApiRef);
  
  // Use the API to fetch data
  // ...

  return (
    <div>
      {/* Field UI */}
    </div>
  );
};
```

## Validation

Custom fields can perform their own validation:

```tsx
const CustomFieldWithValidation: FieldExtensionComponent<{}, string> = ({
  onChange,
  rawErrors,
  formData,
}) => {
  const [localErrors, setLocalErrors] = React.useState<string[]>([]);
  
  // Validate form data
  React.useEffect(() => {
    const errors = [];
    if (!formData) {
      errors.push('Field is required');
    }
    // Custom validation logic
    setLocalErrors(errors);
  }, [formData]);

  // Combine errors
  const allErrors = [...(rawErrors || []), ...localErrors];

  return (
    <div>
      <input
        type="text"
        value={formData || ''}
        onChange={e => onChange(e.target.value)}
      />
      {allErrors.map(error => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
};
```

## Best Practices

1. **Keep field components focused**: Each field should do one thing well.
2. **Use Backstage components**: Try to use existing Backstage UI components for consistency.
3. **Handle validation**: Provide clear feedback for invalid input.
4. **Support accessibility**: Ensure your fields are accessible with proper labels and focus states.
5. **Include error handling**: Handle API errors gracefully.
6. **Add loading states**: Show loading indicators when fetching data.
7. **Test thoroughly**: Write unit tests for your custom fields.

## Conclusion

Custom field extensions provide a powerful way to enhance the template forms in Backstage. By following this guide, you can create specialized inputs tailored to your organization's needs.
