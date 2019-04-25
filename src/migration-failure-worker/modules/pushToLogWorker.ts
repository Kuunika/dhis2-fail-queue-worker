import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';

import { Message } from '..';
import { publishMessage } from '.';

export const pushToLogWorker = async (
  config: DotenvParseOutput,
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName = config.DFQW_ADX_LOG_WORKER || 'ADX_LOG_WORKER';
  await publishMessage(config, worker, queueName, message);
};
