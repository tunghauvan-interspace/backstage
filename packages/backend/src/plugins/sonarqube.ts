import {
    createRouter,
    DefaultSonarqubeInfoProvider,
  } from '@backstage-community/plugin-sonarqube-backend';
  import { Router } from 'express';
  import { PluginEnvironment } from '../types';
  
  export default async function createPlugin(
    env: PluginEnvironment,
  ): Promise<Router> {
    // Add debug logging to help diagnose future issues
    env.logger.info('Initializing SonarQube backend plugin');
    
    try {
      const provider = DefaultSonarqubeInfoProvider.fromConfig(
        env.config,
        env.logger,
      );
      
      // Log available instances for debugging
      env.logger.info('SonarQube configuration loaded successfully');
      
      return await createRouter({
        logger: env.logger,
        sonarqubeInfoProvider: provider,
      });
    } catch (error) {
      env.logger.error(`Failed to initialize SonarQube backend: ${error}`);
      throw error;
    }
  }