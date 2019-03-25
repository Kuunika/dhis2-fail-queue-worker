import axios from "axios";

import { Auth, getAuth, getURL } from "./config";
import { Payload } from "./helper";

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

const query = async (payload: Payload[], payloadSize): Promise<boolean> => {
  const auth: Auth = await getAuth();
  const url: string = `${await getURL()}/dataValueSets`;

  const options: object = {
    auth,
    data: { dataValues: payload },
    method: "POST",
    url
  };

  const res: any = await axios(options).catch((err: Error) => log(err.message));
  const isSuccessful: boolean = processResponse(res, payloadSize);

  return isSuccessful;
};

export { query };
