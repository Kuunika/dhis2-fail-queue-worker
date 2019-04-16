import Worker = require('tortoise');
import { DotenvParseOutput } from 'dotenv';

import { Message } from '..';
import { publishMessage } from '.';

export const pushToEmailQueue = async (
  config: DotenvParseOutput,
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName = config.DFQW_EMAIL_QUEUE_NAME;
  await publishMessage(config, worker, queueName, message);
};
