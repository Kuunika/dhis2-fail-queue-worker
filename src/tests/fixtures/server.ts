import express from 'express';
import * as bodyParser from 'body-parser';

export enum modes {
  fail,
  succeed,
}

const handleSuccessfulPost = async (
  req: express.Request,
  res: express.Response
) => {
  return res.json({
    importCount: {
      updated: req.body.dataValues.length,
    },
  });
};

const handleFailPost = async (
  req: express.Request,
  res: express.Response
) => {
  return res.status(400).send({ message: 'This is an error!' });
};

export const fakeDhis2Server = async (port: number, mode: modes) => {
  const app = express();

  app.use(bodyParser.json({ limit: '100mb' }));

  if (mode === modes.fail) {
    app.post('*', handleFailPost);
  } else { app.post('*', handleSuccessfulPost); }

  return await app.listen(port);
};
