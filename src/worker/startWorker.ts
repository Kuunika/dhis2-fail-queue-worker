import Worker = require('tortoise');
import { Connection } from 'typeorm';
import { DotenvParseOutput } from 'dotenv';

import { createWorker, consumeMessage } from '.';
import { migrate } from './../migration';

import {
  Message,
  pushToFailQueue,
  pushToEmailQueue,
  areAttemptsAvailable,
  isWaiting
} from '.';

const { log } = console;

export const startWorker = async (
  config: DotenvParseOutput,
  connection: Connection
): Promise<void> => {
  const worker: Worker = await createWorker(config);

  const callback = async (message: string, ack: () => void) => {
    try {
      const parsedMessage: Message = JSON.parse(message);

      log(parsedMessage);
      log();

      const { lastAttempt, attempts = 1 } = parsedMessage;
      const inWaiting = await isWaiting(config, lastAttempt);

      if (!inWaiting) {
        parsedMessage.attempts = attempts + 1;
        await migrate(config, connection, worker, parsedMessage);
      } else {
        const inAttempt: boolean = areAttemptsAvailable(config, attempts);
        console.log(attempts, ' : ', inAttempt);
        if (inAttempt) {
          await pushToFailQueue(config, worker, parsedMessage);
        } else {
          parsedMessage.migrationFailed = true;
          parsedMessage.source = 'failqueue';
          await pushToEmailQueue(config, worker, parsedMessage);
        }
      }
    } catch (error) {
      console.log(error.message);
    }

    ack();
  };

  await consumeMessage(config, worker, callback);
};
