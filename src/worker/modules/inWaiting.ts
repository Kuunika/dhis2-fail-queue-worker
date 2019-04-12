import moment from 'moment';
import { DotenvParseOutput } from 'dotenv';

export const isWaiting = (
  config: DotenvParseOutput,
  lastAttempt: any
): boolean => {
  if (!lastAttempt) {
    return false;
  }

  const minutes = Number(moment().diff(moment(lastAttempt), 'minutes'));
  const waitTime = Number(config.DFQW_QUEUE_WAIT_TIME || 30);
  return (waitTime === minutes) ? false : true;
};
