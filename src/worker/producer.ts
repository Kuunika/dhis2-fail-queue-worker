import Worker = require('tortoise');
import { Message } from './helpers';
import { DotenvParseOutput } from 'dotenv';

/**
 * Publish message to email queue.
 *
 * @param { Worker } worker - Worker instance.
 * @param { string } queuName - Queue name.
 * @param { object } message - Message
 */
const publishMessage = async (
  config: DotenvParseOutput,
  worker: Worker,
  queueName: string,
  message: Message
): Promise<void> => {
  const options: object = { durable: config.DFQW_QUEUE_DURABLE || true };
  await worker.queue(queueName, options).publish(message);
};

export { Message, publishMessage };
