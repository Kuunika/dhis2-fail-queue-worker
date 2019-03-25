import { Connection } from 'typeorm';
import { connectToDatabase } from '../datasource';
import { FailQueue } from './../models';

import moment = require('moment');

import Worker = require('tortoise');

import {
  createCounter,
  getFailQueues,
  getPayloadId,
  preparePayload,
  updateFailQueues,
  Where
} from './helpers';

import { Payload, query } from '../query';
import { Message, publishMessage } from '../worker';

const env = process.env;

export const migrate = async (
  worker: Worker,
  message: Message
): Promise<boolean> => {
  const connection: Connection = await connectToDatabase();
  let offset = 0;
  let failedIds: number[] = [0];
  let successIds: number[] = [0];
  let migrationFailed = false;

  const { migrationId = 0, attempts = 1, email, client, channelId } = message;

  const where: Where = { migrationId, isMigrated: false };
  const counter = await createCounter(connection, where);

  for (const count of counter) {
    const failQueues: FailQueue[] = await getFailQueues(
      connection,
      where,
      offset
    );

    if (failQueues) {
      const payload: Payload[] = await preparePayload(connection, failQueues);
      const payloadIsSent: boolean = await query(payload, failQueues.length);

      await console.log(
        count,
        `chunk: `,
        offset + 1,
        `migration ${migrationId}`,
        payloadIsSent
      );

      if (!payloadIsSent) {
        migrationFailed = true;
        failedIds = failedIds.concat(await getPayloadId(payload));
      } else {
        successIds = successIds.concat(await getPayloadId(payload));
      }
    } else {
      migrationFailed = true;
    }
    offset++;
  }

  await updateFailQueues(connection, successIds, {
    isMigrated: true,
    isProcessed: true,
  });

  await updateFailQueues(connection, failedIds, {
    attempts,
    isProcessed: true,
  });

  if (migrationFailed) {
    const queueName = env.DFQW_QUEUE_NAME || 'DHIS2_INTEGRATION_FAIL_QUEUE';
    const date: any = moment();

    const producerMessage: Message = {
      attempts,
      channelId,
      client,
      email,
      lastAttempt: date,
      migrationId,
    };

    await publishMessage(worker, queueName, producerMessage);
  } else {
    const queueName =
      env.DFQW_EMAIL_QUEUE_NAME || 'DHIS2_EMAIL_INTEGRATION_QUEUE';

    const producerMessage: Message = {
      channelId,
      client,
      email,
      migrationFailed,
      migrationId,
      source: 'failqueue',
    };

    await publishMessage(worker, queueName, producerMessage);
  }

  connection.close();
  return migrationFailed;
};
