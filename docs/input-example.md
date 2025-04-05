# Input Examples for Software Templates

This page contains examples of different types of input fields that can be used in Backstage Software Templates.

## Basic Input Field Types

### Text Field

A simple text input field:

```yaml
title: Name
type: string
description: Your name
```

### Number Field

A field that only accepts numbers:

```yaml
title: Age
type: number
description: Your age
```

### Boolean Field

A boolean toggle or checkbox:

```yaml
title: Subscribe to newsletter
type: boolean
description: Would you like to receive updates?
```

## More Advanced Fields

### Select / Dropdown Field

A dropdown with predefined options:

```yaml
title: Favorite color
type: string
description: Select your favorite color
enum:
  - red
  - green
  - blue
  - purple
```

### Multi-select Field

Select multiple items from a list:

```yaml
title: Interests
type: array
description: Select your interests
items:
  type: string
  enum:
    - sports
    - music
    - movies
    - books
```

### Object Structure

Grouping related fields together:

```yaml
title: Address
type: object
properties:
  street:
    title: Street
    type: string
  city:
    title: City
    type: string
  zipCode:
    title: Zip Code
    type: string
```

## Custom UIs with `ui:field`

You can use custom UIs for input fields:

```yaml
title: Repository URL
type: string
ui:field: RepoUrlPicker
ui:options:
  allowedHosts:
    - github.com
```

## Conditional Fields

You can make fields appear based on other field values:

```yaml
title: Custom Domain
type: boolean

title: Domain Name
type: string
ui:if: "{{ parameters['Custom Domain'] }}"
```

## Integration with Backstage APIs

### Entity Picker

Pick an entity from the catalog:

```yaml
title: Component
type: string
ui:field: EntityPicker
ui:options:
  catalogFilter:
    kind: Component
```

### Owner Picker

Select an owner from the catalog:

```yaml
title: Owner
type: string
ui:field: OwnerPicker
ui:options:
  allowedKinds:
    - Group
```

## Working with Dependencies

You can make options depend on other field values:

```yaml
title: Organization
type: string
ui:field: EntityPicker
ui:options:
  catalogFilter:
    kind: Group

title: Repository
type: string
ui:field: RepoUrlPicker
ui:options:
  allowedHosts:
    - github.com
  allowedOwners:
    - "{{ parameters.Organization }}"
```

For more information, see the [full documentation](https://backstage.io/docs/features/software-templates/writing-templates).
