import Worker = require('tortoise');
import { Connection } from 'typeorm';
import { DotenvParseOutput } from 'dotenv';

import { createWorker, consumeMessage } from '.';
import { migrate } from './../migration';

import {
  Message,
  pushToFailQueue,
  pushToEmailQueue,
  checkAttemptsAvailability,
  isWaiting
} from '.';

const { log, error } = console;

export const migrationFailureWorker = async (
  config: DotenvParseOutput,
  connection: Connection
): Promise<void> => {
  const worker: Worker = await createWorker(config).catch(e => error(e));

  const processFailure = async (message: string, acknowledgment: () => void) => {
    try {
      const parsedMessage: Message = JSON.parse(message);
      log('\n', parsedMessage);

      const { lastAttempt, attempts = 1 } = parsedMessage;
      const inWaitingPeriod = await isWaiting(config, lastAttempt);

      if (!inWaitingPeriod) {
        parsedMessage.attempts = attempts + 1;
        await migrate(config, connection, worker, parsedMessage);
      }

      if (inWaitingPeriod) {
        const attemptsNotExhausted = checkAttemptsAvailability(config, attempts);
        if (attemptsNotExhausted) {
          await pushToFailQueue(config, worker, parsedMessage);
        }

        if (!attemptsNotExhausted) {
          parsedMessage.migrationFailed = true;
          parsedMessage.source = 'failqueue';
          await pushToEmailQueue(config, worker, parsedMessage);
        }
      }
    } catch (err) {
      error(err.message);
    }
    acknowledgment();
  };

  await consumeMessage(config, worker, processFailure);
};
