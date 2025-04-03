# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

## Prerequisites

- Node.js 20 or 22 (as specified in package.json)
- Yarn

## Getting Started

To start the app, run:

```sh
yarn install
yarn dev
```

## Troubleshooting

### Node.js Version Issues

If you encounter errors like `TypeError: Module.register is not a function`, make sure you're using the correct Node.js version:

1. Check your current Node.js version:
   ```
   node --version
   ```

2. If you're not using Node.js 20 or 22, install and use the correct version:
   
   Using nvm (recommended):
   ```
   nvm install 20
   nvm use 20
   ```
   
   Or download from [Node.js official website](https://nodejs.org/)

3. After changing Node.js version, run:
   ```
   yarn install
   yarn dev
   ```
