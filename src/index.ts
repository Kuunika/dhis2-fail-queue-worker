import { join } from 'path';
import 'reflect-metadata';

import { consumer } from './worker';
import { DotenvParseOutput, loadConfig } from './config';

const log = console.log;
const path = join(__dirname, '..', '.env');

/**
 * Main function
 */
const main = async (): Promise<void> => {
  const config: DotenvParseOutput | undefined = await loadConfig(path);
  if (!config) {
    log('application failed to load environment variables');
    process.exit(1);
  }

  await consumer();
};

main();
