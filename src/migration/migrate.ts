import { Connection } from 'typeorm';
import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';
import moment = require('moment');

import { FailedDataElement } from './../models';

import {
  createCounter,
  getFailQueues,
  getPayloadId,
  getDHIS2DataElements,
  updateFailedDataElements,
  Where
} from './helpers';

import { DHIS2DataElement, query as sendPayload } from '../query';
import { Message, pushToEmailQueue, pushToFailQueue } from '../worker';
import { PusherLogger } from '../Logger';

export const migrate = async (
  config: DotenvParseOutput,
  connection: Connection,
  worker: Worker,
  message: Message
): Promise<boolean> => {
  let offset = 0;
  let failedIds: number[] = [0];
  let successIds: number[] = [0];

  let hasMigrationFailed = false;

  const { migrationId = 0, attempts = 1, channelId } = message;

  const pusherLogger = await new PusherLogger(config, channelId);

  const where: Where = { migrationId, isMigrated: false };
  const chunkCounter = await createCounter(connection, where);

  for (const count of chunkCounter) {
    console.log('processing chunk #: ', offset + 1);
    const failedDataElements: FailedDataElement[] = await getFailQueues(
      connection,
      where,
      offset
    );

    await pusherLogger.info(`chunk ${offset + 1} of ${chunkCounter.length}`);

    if (failedDataElements) {
      const dhis2Payload: DHIS2DataElement[] = await getDHIS2DataElements(
        connection,
        failedDataElements
      );

      const payloadIsSent: boolean = await sendPayload(
        config,
        dhis2Payload,
        failedDataElements.length
      );

      await console.log(
        count,
        `chunk: `,
        offset + 1,
        `migration ${migrationId}`,
        payloadIsSent
      );

      if (!payloadIsSent) {
        hasMigrationFailed = true;
        failedIds = failedIds.concat(await getPayloadId(dhis2Payload));
      } else {
        successIds = successIds.concat(await getPayloadId(dhis2Payload));
      }
    }

    if (!failedDataElements) {
      hasMigrationFailed = true;
    }

    offset++;
  }

  await updateFailedDataElements(connection, successIds, {
    isMigrated: true,
    isProcessed: true,
  });

  await updateFailedDataElements(connection, failedIds, {
    attempts,
    isProcessed: true,
  });

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

  return hasMigrationFailed;
};
