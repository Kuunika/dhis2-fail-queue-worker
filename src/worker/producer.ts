import Worker = require('tortoise');
import { Message } from './helpers';

const env = process.env;

/**
 * Publish message to email queue.
 *
 * @param { Worker } worker - Worker instance.
 * @param { string } queuName - Queue name.
 * @param { object } message - Message
 */
const publishMessage = async (
  worker: Worker,
  queueName: string,
  message: Message
): Promise<void> => {
  const options: object = { durable: env.DFQW_QUEUE_DURABLE || true };
  await worker.queue(queueName, options).publish(message);
};

export { Message, publishMessage };
