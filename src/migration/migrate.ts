import { Connection } from 'typeorm';
import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';

import {
  createChunkCounter,
  getMigrationDataElements,
  generateDHIS2Payload,
  updateFailQueueDataElements,
  persistSuccessfulMigrationDataElements,
  updateMigration
} from '.';

import { Message, pushToEmailQueue, pushToFailQueue, pushToLogWorker } from '../migration-failure-worker';
import { isDHISMigrationSuccessful, sendDhis2Payload } from '../query';
import moment = require('moment');

// import { DHIS2DataElement, query as sendPayload } from '../query';

export const migrate = async (
  config: DotenvParseOutput,
  connection: Connection,
  worker: Worker,
  message: Message
): Promise<void> => {
  let offset = 0;
  let successIds: number[] = [0];
  let hasMigrationFailed = false;

  const { migrationId, attempts } = message;

  message.service = 'FAIL QUEUE WORKER';

  const chunkCounter = await createChunkCounter(
    config,
    connection,
    migrationId
  );

  for (const _ of chunkCounter) {
    message.message = JSON.stringify({ message: `chunk ${offset + 1} of ${chunkCounter.length}`, service: 'failqueue' });
    await pushToLogWorker(config, worker, message);

    const migrationDataElements = await getMigrationDataElements(
      config,
      connection,
      migrationId,
      offset
    );

    if (migrationDataElements) {
      const [
        dhis2DataElements,
        migrationDataElementsIds,
      ] = await generateDHIS2Payload(migrationDataElements);

      const dhis2Response = await sendDhis2Payload(config, dhis2DataElements);

      const wasDHIS2MigrationSuccessful = isDHISMigrationSuccessful(
        dhis2Response,
        dhis2DataElements.length
      );

      message.message = JSON.stringify({ message: `wasDHIS2MigrationSuccessful: ${wasDHIS2MigrationSuccessful}`, service: 'failqueue' });
      await pushToLogWorker(config, worker, message);

      if (!wasDHIS2MigrationSuccessful) {
        hasMigrationFailed = true;
      }

      if (wasDHIS2MigrationSuccessful) {
        successIds = successIds.concat(migrationDataElementsIds);
      }
    }

    if (!migrationDataElements) {
      hasMigrationFailed = true;
    }

    offset++;
  }

  await updateFailQueueDataElements(connection, migrationId, attempts);
  await persistSuccessfulMigrationDataElements(connection, successIds);

  await updateMigration(
    connection,
    migrationId,
    successIds.slice(1)
  );

  if (hasMigrationFailed) {
    const date: any = moment();
    const failQueueMessage: Message = {
      ...message,
      attempts,
      lastAttempt: date,
    };
    await pushToFailQueue(config, worker, failQueueMessage);
  } else {
    const producerMessage: Message = {
      ...message,
      migrationFailed: hasMigrationFailed,
      source: 'failqueue',
    };
    await pushToEmailQueue(config, worker, producerMessage);
  }

  offset = 0;
  successIds = [0];

};
