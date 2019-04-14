import { DotenvParseOutput } from 'dotenv';

export const checkAttemptsAvailability = (
  config: DotenvParseOutput,
  attempts: number
): boolean => {
  const MAX_ATTEMPTS = Number(config.DFQW_QUEUE_ATTEMPTS || 5);
  return Number(attempts) >= MAX_ATTEMPTS ? false : true;
};
