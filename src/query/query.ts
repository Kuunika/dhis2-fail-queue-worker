import axios from 'axios';

import { Auth, getAuth } from './config';
import { DotenvParseOutput } from 'dotenv';
import { DHIS2DataElement } from 'src/migration';

const log = console.log;

export const isDHISMigrationSuccessful = (
  dhis2Response: any,
  payloadSize: number
): boolean => {
  if (dhis2Response) {
    const updated = dhis2Response.data.importCount.updated;
    if (payloadSize === Number(updated)) {
      return true;
    }
  }
  return false;
};

export const sendDhis2Payload = async (
  config: DotenvParseOutput,
  dhis2DataElements: DHIS2DataElement[]
): Promise<any> => {
  const auth: Auth = await getAuth(config);
  const url = `${config.DFQW_DHIS2_URL}/dataValueSets`;

  const options: object = {
    auth,
    data: { dataValues: dhis2DataElements },
    method: 'POST',
    url,
  };

  return await axios(options).catch((err: Error) =>
    log(`query error: ${err.message}`)
  );
};
