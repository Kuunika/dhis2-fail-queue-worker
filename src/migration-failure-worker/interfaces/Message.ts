export interface Message {
  attempts?: number;
  channelId: string;
  client: string;
  email?: string;
  lastAttempt?: any;
  migrationFailed?: boolean;
  migrationId: number;
  source?: string;
  service?: string;
  message?: string;
  description: string;
}
