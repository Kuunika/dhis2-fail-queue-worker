import 'reflect-metadata';
import { join } from 'path';

import { loadConfig } from './config';
import { startWorker } from './worker';
import { connectToDatabase } from './datasource';

const main = async (): Promise<void> => {
  const path = join(__dirname, '..', '.env');
  const config = await loadConfig(path);
  const connection = await connectToDatabase(config);
  await startWorker(config, connection);
};

main();
