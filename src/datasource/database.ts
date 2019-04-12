import { Migration, MigrationDataElements } from './../models';
import { DotenvParseOutput } from 'dotenv';

import { ConnectionOptions, createConnection, Connection } from 'typeorm';

export const connectToDatabase = async (
  config: DotenvParseOutput
): Promise<Connection> => {
  const options: ConnectionOptions = {
    database: config.DFQW_DATABASE || 'dhis2-integration-mediator',
    entities: [Migration, MigrationDataElements],
    host: config.DFQW_DATABASE_HOST || 'localhost',
    password: config.DFQW_DATABASE_PASSWORD || '',
    port: Number(config.DFQW_DATABASE_PORT) || 3306,
    type: 'mysql',
    username: config.DFQW_DATABASE_USERNAME || 'root',
  };

  return createConnection(options);
};
