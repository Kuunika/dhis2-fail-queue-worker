import { Client, DataElement, FailQueue } from "./../models";

import { ConnectionOptions, createConnection } from "typeorm";

const env = process.env;
export const connectToDatabase = async () => {
  const options: ConnectionOptions = {
    database: env.DFQW_DATABASE || "dhis2-integration-mediator",
    entities: [Client, DataElement, FailQueue],
    host: env.DFQW_DATABASE_HOST || "localhost",
    password: env.DFQW_DATABASE_PASSWORD || "",
    port: Number(env.DFQW_DATABASE_PORT) || 3306,
    type: "mysql",
    username: env.DFQW_DATABASE_USERNAME || "root"
  };

  return createConnection(options);
};
