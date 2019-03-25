import { migrate } from './../migration';

import Worker = require('tortoise');
import {
  consume,
  createWorker,
  Message,
  pushToFailQueue,
  pushToEmailQueue,
  areAttemptsAvailable,
  isWaiting
} from './helpers';

const env = process.env;

export const consumer = async (): Promise<void> => {
  const host: string | undefined = env.DFQW_QUEUE_HOST || 'amqp://localhost';
  const worker: Worker = await createWorker(host);

  const callback = async (message: any, ack: any) => {
    try {
      const parsedMessage: Message = JSON.parse(message);

      const { lastAttempt = undefined, attempts = 1 } = parsedMessage;
      const inWaiting: boolean = await isWaiting(lastAttempt);

      if (!inWaiting) {
        parsedMessage.attempts = attempts + 1;
        await migrate(worker, parsedMessage);
      } else {
        const inAttempt: boolean = areAttemptsAvailable(attempts);
        if (inAttempt) {
          await pushToFailQueue(worker, parsedMessage);
          console.log('in attempt', inAttempt, attempts);
        } else {
          await pushToEmailQueue(worker, parsedMessage);
        }
      }
    } catch (error) {
      console.log(error.message);
    }

    ack();
  };

  const defaultQueueName = 'DHIS2_INTEGRATION_FAIL_QUEUE';
  const queueName = process.env.DFQW_QUEUE_NAME || defaultQueueName;
  await consume(worker, queueName, callback);
};
