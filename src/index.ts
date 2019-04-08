import { join } from 'path';
import 'reflect-metadata';

import { loadConfig } from './config';
import { connectToDatabase } from './datasource';
import { startWorker } from './worker';

const path = join(__dirname, '..', '.env');

/**
 * Main function
 */
const main = async (): Promise<void> => {
  // TODO: Load configurations
  const config = await loadConfig(path);

  // TODO: connect to database
  const connection = await connectToDatabase(config);

  // TODO: start worker
  await startWorker(config, connection);
};

main();
