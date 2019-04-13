import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';

export const createWorker = async (
  config: DotenvParseOutput
): Promise<Worker> => {
  const options: object = {
    connectRetries: config.DFQW_QUEUE_CONNECT_RETRIES || 2,
    connectRetryInterval: config.DFQW_QUEUE_CONNECT_RETRY_INTERVAL || 100,
  };

  const host = config.DFQW_QUEUE_HOST || 'amqp://localhost';
  const worker = await new Worker(host, options);
  worker.on(Worker.EVENTS.CONNECTIONDISCONNECTED, () => console.log('disconnected'));
  return worker;
};
