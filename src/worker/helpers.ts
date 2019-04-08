import Worker = require("tortoise");
import moment from "moment";
import { DotenvParseOutput } from "dotenv";

const env = process.env;

import { publishMessage } from "./producer";

interface Message {
  attempts?: number;
  channelId: string;
  client: string;
  email: string;
  lastAttempt?: any;
  migrationFailed?: boolean;
  migrationId: number;
  source?: string;
}

/**
 * Create worker instance.
 *
 * @param { string } host - RabbitMQ host
 */
const createWorker = async (host: string): Promise<Worker> => {
  const options: object = {
    connectRetries: env.DFQW_QUEUE_CONNECT_RETRIES || 2,
    connectRetryInterval: env.DFQW_QUEUE_CONNECT_RETRY_INTERVAL || 100
  };

  return await new Worker(host, options);
};

/**
 * Connect to queue
 *
 * @param { Worker } worker - Worker instance.
 * @param { sting } queueName - Queue name.
 * @param { function } processMessage - Function
 */
const consume = async (
  worker: Worker,
  queueName: string,
  // tslint:disable-next-line: ban-types
  callback: (message: string, ack: () => void) => void
): Promise<void> => {
  const options: object = { durable: env.DFQW_QUEUE_DURABLE || true };

  await worker
    .queue(queueName, options)
    .prefetch(1)
    .subscribe(callback);
};

const pushToFailQueue = async (
  config: DotenvParseOutput,
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName = config.DFQW_QUEUE_NAME;
  await publishMessage(config, worker, queueName, message);
};

const pushToEmailQueue = async (
  config: DotenvParseOutput,
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName = config.DFQW_EMAIL_QUEUE_NAME;
  await publishMessage(config, worker, queueName, message);
};

const areAttemptsAvailable = (
  config: DotenvParseOutput,
  attempts: number
): boolean => {
  const MAX_ATTEMPTS = Number(config.DFQW_QUEUE_ATTEMPTS || 5);
  return Number(attempts) >= MAX_ATTEMPTS ? false : true;
};

const isWaiting = (config: DotenvParseOutput, lastAttempt: any): boolean => {
  if (!lastAttempt) {
    return false;
  } else {
    const then = moment(lastAttempt);
    const now = moment();
    const minutes = Number(now.diff(then, "minutes"));
    const waitTime = Number(config.DFQW_QUEUE_WAIT_TIME || 30);

    if (waitTime === minutes) {
      return false;
    } else {
      return true;
    }
  }
};

export {
  createWorker,
  consume,
  Message,
  pushToEmailQueue,
  pushToFailQueue,
  areAttemptsAvailable,
  isWaiting
};
