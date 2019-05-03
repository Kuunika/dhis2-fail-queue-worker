import { join } from 'path';
import { Connection } from 'typeorm';
import { DotenvParseOutput } from 'dotenv';
import Worker = require('tortoise');
import { createWorker, Message } from '../migration-failure-worker';

import { loadConfig } from '../config';
import { connectToDatabase } from '../datasource';
import { migration, modes, fakeDhis2Server, migrationDataElements } from './fixtures';
import { Migration } from '../models/Migration';
import { MigrationDataElements } from '../models/MigrationDataElements';
import { migrate } from '../migration';

let path: string;
let config: DotenvParseOutput;
let connection: Connection;
let testMigration: Migration;
let testMigrationDataElement: MigrationDataElements;
let worker: Worker;
let message: Message;
let server: any;

describe('', () => {

  beforeEach(async () => {
    path = join(__dirname, 'fixtures', '.env.test');
    config = await loadConfig(path);

    connection = await connectToDatabase(config);

    testMigration = new Migration();
    testMigration.clientId = migration.clientId;
    testMigration.createdAt = migration.createdAt;
    testMigration.totalFailedElements = 1;

    await connection.getRepository(Migration).query(`TRUNCATE TABLE Migration;`);
    await connection.getRepository(Migration).save(testMigration);

    testMigrationDataElement = new MigrationDataElements();
    testMigrationDataElement.migrationId = testMigration.id;
    testMigrationDataElement.facilityId = testMigration.id;
    testMigrationDataElement.productId = testMigration.id;
    testMigrationDataElement.organizationUnitCode = migrationDataElements.organizationUnitCode;
    testMigrationDataElement.dataElementCode = migrationDataElements.dataElementCode;
    testMigrationDataElement.value = migrationDataElements.value;
    testMigrationDataElement.reportingPeriod = migrationDataElements.reportingPeriod;
    testMigrationDataElement.isProcessed = migrationDataElements.isProcessed;
    testMigrationDataElement.createdAt = migrationDataElements.createdAt;

    await connection.getRepository(MigrationDataElements).query(`TRUNCATE TABLE MigrationDataElements;`);
    await connection.getRepository(MigrationDataElements).save(testMigrationDataElement);

    message = {
      channelId: 'asdhedas',
      client: 'test client',
      migrationId: testMigration.id,
      description: 'test description',
      attempts: 2,
    };

    worker = await createWorker(config);
  });

  afterEach(async () => {
    await connection.close();
    await worker.destroy();
    await server.close();
  });

  it('should successfully send data elements that failed migration to dhis2', async () => {
    server = await fakeDhis2Server(3000, modes.succeed);
    await migrate(config, connection, worker, message);
    testMigrationDataElement = await connection.getRepository(MigrationDataElements).findOne(testMigrationDataElement);

    expect(testMigrationDataElement.createdAt).toBeTruthy();
  });

  it('should failt to send data elements that failed migration to dhis2', async () => {
    server = await fakeDhis2Server(3000, modes.fail);
    await migrate(config, connection, worker, message);

    await setTimeout(async () => {
      testMigrationDataElement = await connection.getRepository(MigrationDataElements).findOne(testMigrationDataElement);
      // tslint:disable-next-line:no-null-keyword
      expect(testMigrationDataElement.createdAt).toBe(null);
    }, 2000);

  });

});
