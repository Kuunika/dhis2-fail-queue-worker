import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';

export const consumeMessage = async (
  config: DotenvParseOutput,
  worker: Worker,
  callback: (message: string, acknowledgment: () => Promise<void>) => void
): Promise<void> => {
  const options: object = { durable: config.DFQW_QUEUE_DURABLE || true };

  await worker
    .queue(config.DFQW_QUEUE_NAME || 'DHIS2_EMAIL_INTEGRATION_QUEUE', options)
    .prefetch(1)
    .subscribe(callback);
};
