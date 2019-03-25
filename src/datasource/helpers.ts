import { Connection } from "typeorm";

const closeConnection = (connection: Connection): void => {
  connection.close();
};

export { closeConnection };
