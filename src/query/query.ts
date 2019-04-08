import axios from 'axios';

import { Auth, getAuth } from './config';
import { DHIS2DataElement } from './helper';
import { DotenvParseOutput } from 'dotenv';

const log = console.log;

const processResponse = (res: any, payloadSize): boolean => {
  if (res) {
    const updated = res.data.importCount.updated;
    if (payloadSize === Number(updated)) {
      return true;
    }
  }
  return false;
};

const sendDhis2Payload = async (
  config: DotenvParseOutput,
  dhis2DataElements: DHIS2DataElement[],
  payloadSize
): Promise<boolean> => {
  const auth: Auth = await getAuth(config);
  const url = `${config.DFQW_DHIS2_URL}/dataValueSets`;

  const options: object = {
    auth,
    data: { dataValues: dhis2DataElements },
    method: 'POST',
    url,
  };

  const res: any = await axios(options).catch((err: Error) =>
    log(`query error: ${err.message}`)
  );
  const isSuccessful: boolean = processResponse(res, payloadSize);

  return isSuccessful;
};

export { sendDhis2Payload as query };
