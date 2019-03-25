import { Connection } from 'typeorm';
import { connectToDatabase } from '../../datasource';
import { FailQueue, DataElement } from '../../models';
import { join } from 'path';
import { loadConfig } from '../../config';
import { createWorker, Message, areAttemptsAvailable } from '../../worker';
import { migrate } from '../../migration';

let connection: Connection;
let path: string | undefined;
let failQueue: FailQueue | undefined;
let dataElement: DataElement | undefined;
let worker: Worker;

describe('Migration Tests', () => {
  beforeEach(async () => {
    path = join(__dirname, '../../..', '.env');

    await loadConfig(path);
    const host: string | undefined =
      process.env.DFQW_QUEUE_HOST || 'amqp://localhost';
    worker = await createWorker(host);
  });

  afterEach(async () => {
    worker = undefined;
  });

  it('should ensure that failed posts are correctly queued', async (): Promise<
    void
  > => {
    connection = await connectToDatabase();

    dataElement = new DataElement();

    dataElement.dataSetId = 1;
    dataElement.dataElementId = 'gS9ZOaVhfLS';
    dataElement.dataElementName = 'SUT Catgut chromic suture sterile';

    const savedDataElement: DataElement = await connection.manager.save(
      dataElement
    );

    expect(dataElement.dataElementId).toBe(savedDataElement.dataElementId);

    failQueue = new FailQueue();

    failQueue.organizationUnitCode = 'q9qra0ng8xZ';
    failQueue.dataElementId = savedDataElement.id;
    failQueue.migrationId = 1;
    failQueue.value = 420;
    failQueue.isProcessed = false;
    failQueue.isMigrated = false;
    failQueue.period = '201801';
    failQueue.attempts = 1;
    failQueue.migratedAt = '2019-03-20 15:02:33';

    const savedFailQueue: FailQueue = await connection.manager.save(failQueue);

    await connection.close();

    expect(failQueue.migrationId).toBe(savedFailQueue.migrationId);
  });

  it('should ensure that the failure queue is processed correctly', async () => {
    const message: Message = {
      attempts: 1,
      channelId: '123456',
      client: 'openmls',
      email: 'o@gmail.com',
      migrationId: 1,
    };
    const result: boolean = await migrate(worker, message);
    expect(result).toBe(false);
  }, 100000);

  it('should check that the status of the queue for the migration has reached the limit', async () => {
    expect(areAttemptsAvailable(2)).toBe(true);
    expect(areAttemptsAvailable(3)).toBe(false);
  });
});
