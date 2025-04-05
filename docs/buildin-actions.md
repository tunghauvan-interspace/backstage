# Built-in Actions

The scaffolder comes with several built-in actions for templates.

## catalog:register

This action is used to register an entity to the catalog after creation.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-react-app-template
  title: Create React App Template
  description: Create a new CRA website project
  tags:
    - recommended
    - react
spec:
  owner: web@example.com
  type: website
  parameters:
    # ...
  steps:
    # ...
    - id: register
      name: Register
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: "/catalog-info.yaml"
```

## catalog:write

This action writes a catalog descriptor file. This is useful if you need to create a catalog entity descriptor file as a separate step.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-catalog-entity
  title: Create Catalog Entity
  description: Creates a catalog entity descriptor file
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: create-catalog-info
      name: Create catalog entity file
      action: catalog:write
      input:
        entity:
          apiVersion: backstage.io/v1alpha1
          kind: Component
          metadata:
            name: ${{ parameters.name }}
            annotations:
              github.com/project-slug: ${{ parameters.repoName }}
          spec:
            type: service
            lifecycle: experimental
            owner: ${{ parameters.owner }}
```

## debug:log

Writes a message as a step in the scaffolding task.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: debug-log-example
  title: Debug Log Example
  description: Shows how to log debug messages
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: debug
      name: Debug
      action: debug:log
      input:
        message: Hello, World!
        # Optional:
        listenerUrl: https://localhost:3000/${JSON.stringify({hello: 'world'})}
```

## publish:github

Publishes a directory to GitHub.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: publish-github-example
  title: Publish to GitHub
  description: Publishes a directory to GitHub
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: publish
      name: Publish to GitHub
      action: publish:github
      input:
        repoUrl: github.com?owner=${{ parameters.owner }}&repo=${{ parameters.repo }}
        description: ${{ parameters.description }}
        access: ${{ parameters.access }}
        sourcePath: ${{ parameters.path }}
        defaultBranch: main
        protectDefaultBranch: false
        # Optional:
        deleteBranchOnMerge: true
        gitCommitMessage: "Initial commit"
        gitAuthorName: ${{ parameters.authorName }}
        gitAuthorEmail: ${{ parameters.authorEmail }}
```

## github:actions:dispatch

Dispatches a GitHub workflow for a repository.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: github-actions-dispatch-example
  title: Dispatch GitHub Workflow
  description: Dispatches a GitHub workflow
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: dispatch
      name: Dispatch Workflow
      action: github:actions:dispatch
      input:
        workflowId: my-workflow
        repoUrl: github.com?owner=${{ parameters.owner }}&repo=${{ parameters.repo }}
        branchOrTagName: main
```

## fs:write

Writes content to the filesystem.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: fs-write-example
  title: Write File Example
  description: Writes content to a file
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: write
      name: Write File
      action: fs:write
      input:
        path: ./foo/bar.txt
        content: |
          Hello World!
          This is a scaffolded file.
```

## fs:delete

Deletes files from the filesystem.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: fs-delete-example
  title: Delete Files Example
  description: Deletes files from the filesystem
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: delete
      name: Delete Files
      action: fs:delete
      input:
        files:
          - ./foo/bar.txt
          - ./baz/qux.md
```

## run:script

Runs a script inside the workspace.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: run-script-example
  title: Run Script Example
  description: Runs a script inside the workspace
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: run-script
      name: Run Script
      action: run:script
      input:
        command: node
        args: ["--version"]
```

## fetch:template

Fetches a template from a remote location and renders template files using the Nunjucks template engine.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: fetch-template-example
  title: Fetch Template Example
  description: Fetches a template from a URL
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: fetch-template
      name: Fetch Template
      action: fetch:template
      input:
        url: ./template
        values:
          name: ${{ parameters.name }}
          owner: ${{ parameters.owner }}
          description: ${{ parameters.description }}
```

## fetch:plain

Fetches a directory of plain files from a remote location.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: fetch-plain-example
  title: Fetch Plain Example
  description: Fetches plain files from a URL
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: fetch-plain
      name: Fetch Plain
      action: fetch:plain
      input:
        url: ./plain-files
        targetPath: ./target-directory
```

## http:backstage:request

Makes an HTTP request to a Backstage API.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: http-backstage-request-example
  title: Backstage Request Example
  description: Makes a request to a Backstage API
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: backstage-request
      name: Backstage Request
      action: http:backstage:request
      input:
        method: GET
        path: /api/catalog/entities
        params:
          filter: kind=Component
```

## http:generic:request

Makes an HTTP request to any URL.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: http-generic-request-example
  title: Generic HTTP Request Example
  description: Makes a generic HTTP request
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:
    # ...
  steps:
    - id: generic-request
      name: Generic Request
      action: http:generic:request
      input:
        method: GET
        url: https://example.com/api
        headers:
          Content-Type: application/json
        body:
          some: value
```

## Looking for more actions?

Backstage provides a plugin ecosystem where you can find or create more actions to extend your templates. Check the Backstage Plugins page or community contributions for additional actions.
