# Writing Templates

> **Navigation**: [Home](./index.md) > Writing Templates

Templates are stored in the [Software Catalog](../software-catalog/descriptor-format.md) as
[Kind](../software-catalog/descriptor-format.md#kind-required) `Template`. The
minimum requirement for registering a template is a
[metadata](../software-catalog/descriptor-format.md#metadata-required) name, and
a spec.template with a `path` to the template definition.

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: v1beta3-demo
  title: Test Action template
  description: scaffolder v1beta3 template demo
spec:
  owner: backstage/techdocs-core
  type: service

  parameters:
    - title: Fill in some steps
      required:
        - name
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the component
          ui:autofocus: true
          ui:options:
            rows: 5
    - title: Choose a location
      required:
        - repoUrl
      properties:
        repoUrl:
          title: Repository Location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - github.com

  steps:
    - id: fetch-base
      name: Fetch Base
      action: fetch:template
      input:
        url: ./template
        values:
          name: ${{ parameters.name }}

    - id: fetch-docs
      name: Fetch Docs
      action: fetch:template
      input:
        url: ./docs
        values:
          name: ${{ parameters.name }}

    - id: publish
      name: Publish
      action: publish:github
      input:
        allowedHosts: ['github.com']
        description: This is ${{ parameters.name }}
        repoUrl: ${{ parameters.repoUrl }}
        defaultBranch: main

    - id: register
      name: Register
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'

  output:
    links:
      - title: Repository
        url: ${{ steps.publish.output.remoteUrl }}
      - title: Open in catalog
        icon: catalog
        entityRef: ${{ steps.register.output.entityRef }}
```

## Template Anatomy

Let's take a look at the Template anatomy and what each field does:

### apiVersion and kind

The `apiVersion` and `kind` are used to identify the template, so that the
catalog plugin knows it's a template.

### metadata

The metadata object is used to store metadata about the template, like the name
of the template, a title and description. This works the same way as any other
descriptor.

### spec.parameters

The spec parameters are used to generate a form for the template. This is where
you define the parameters that the user can fill in when they use the template.
The parameters are defined using the [JSON Schema](https://json-schema.org/) standard.

These can be used within the `steps` part of the template. These `steps` and the
usage of the parameters are described below.

*Note*: You can select different UI widgets by using the `ui:field` annotation.

### spec.steps

The `spec.steps` is where the work happens to execute the template. You define
what steps should be done during the scaffolding of the template. You can find a list of all
available action commands
[here](./builtin-actions.md).

### spec.output

The `spec.output` is where the template can specify the outputs of the executed
steps. It can be defined as a mapping of string title to the URL to be followed.

## Creating your own template

There are two main ways that you can create your own template, you can either

1. Use a tool to bootstrap some template code for you, or
2. Create one from scratch

### Use a Tool

You can use [`@backstage/create-app`](https://www.npmjs.com/package/@backstage/create-app) to bootstrap a new Backstage application. Select "Template" when the command asks what plugin to create.

```bash
npx @backstage/create-app
```

The bootstrapped template creates a simple example software template.

### Create from scratch

You can also create a template from scratch and register it with Backstage. There are a few pieces that you need to have in place.

1. The Template entity defined in YAML
2. The skeleton content that users will end up with when they complete the scaffolding process

Let's look at the details of both of these.

## Template Entity

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
# some metadata about the template itself
metadata:
  name: v1beta3-demo
  title: Test Action template
  description: scaffolder v1beta3 template demo
spec:
  owner: backstage/techdocs-core
  type: service
  # these are the steps that are executed in series
  steps: []
  
  # some outputs that are saved along with the job for use in the frontend
  output:
    links:
      - title: Repository
        url: '{{ steps.publish.output.remoteUrl }}'
      - title: Open in catalog
        icon: catalog
        entityRef: '{{ steps.register.output.entityRef }}'
```

## Parameters

The parameters sections defines what will appear as form fields for users to select when they use the template. It uses [JSON Forms](https://jsonforms.io/) schema.

```yaml
parameters:
  - title: Fill in some steps
    required:
      - name
    properties:
      name:
        title: Name
        type: string
        description: Unique name of the component
        ui:autofocus: true
        ui:options:
          rows: 5
```

## Template Contents

Template contents typically live in a directory relative to the template definition YAML file. Your template may define a skeleton that is downloaded, along with any logic to update the skeleton.

## Testing Templates

Templates can be tested locally by registering them in your local catalog. You can also use the `dry-run` command to test the template without creating any resources.

## See Also

- [Input Field Examples](./input-example.md)
- [Custom Actions](./custom-actions.md)
- [Built-in Actions](./buildin-actions.md)

---

_Return to [Software Templates Home](./index.md)_
