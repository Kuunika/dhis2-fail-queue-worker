import moment from 'moment';
import { DotenvParseOutput } from 'dotenv';

export const inWaitingPeriod = (
  config: DotenvParseOutput,
  lastAttempt: any
): boolean => {
  if (!lastAttempt) {
    return false;
  }

  // TODO: try to see if you can just get diff frome
  const minutes = Number(moment().diff(moment(lastAttempt), 'minutes'));
  const waitTime = Number(config.DFQW_QUEUE_WAIT_TIME || 30);
  return (waitTime === minutes) ? false : true;
};
