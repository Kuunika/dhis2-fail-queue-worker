import 'reflect-metadata';
import { join } from 'path';

import { loadConfig } from './config';
import { migrationFailureWorker } from './migration-failure-worker';
import { connectToDatabase } from './datasource';

const main = async (): Promise<void> => {
  const environmentVariablesPath = join(__dirname, '..', '.env');
  const config = await loadConfig(environmentVariablesPath);
  const connection = await connectToDatabase(config);
  await migrationFailureWorker(config, connection);
};

main();
