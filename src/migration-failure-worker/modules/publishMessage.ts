import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';
import { Message } from '..';

export const publishMessage = async (
  config: DotenvParseOutput,
  worker: Worker,
  queueName: string,
  message: Message
): Promise<void> => {
  const options: object = { durable: config.DFQW_QUEUE_DURABLE || true };
  console.log(message);
  await worker.queue(queueName, options).publish(message);
};
