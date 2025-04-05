import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { PluginEnvironment } from '../types';

export class StartupHooksRegistry {
  private readonly logger: Logger;
  private readonly config: Config;
  private hooks: Array<{ name: string; hook: () => Promise<void> }> = [];

  constructor(env: PluginEnvironment) {
    this.logger = env.logger;
    this.config = env.config;
  }

  register(name: string, hook: () => Promise<void>): void {
    this.hooks.push({ name, hook });
    this.logger.info(`Registered startup hook: ${name}`);
  }

  async runAll(): Promise<void> {
    this.logger.info(`Running ${this.hooks.length} startup hooks`);
    
    for (const { name, hook } of this.hooks) {
      try {
        this.logger.info(`Running startup hook: ${name}`);
        await hook();
        this.logger.info(`Startup hook completed: ${name}`);
      } catch (error) {
        this.logger.error(`Error in startup hook ${name}: ${error}`);
      }
    }
    
    this.logger.info('All startup hooks completed');
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<StartupHooksRegistry> {
  const registry = new StartupHooksRegistry(env);
  
  // Register your hooks here
  registry.register('example-hook', async () => {
    // Example startup logic
    env.logger.info('Example startup hook executing');
  });
  
  return registry;
}
