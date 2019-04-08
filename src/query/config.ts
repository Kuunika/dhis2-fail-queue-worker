import { DotenvParseOutput } from 'dotenv';

interface Auth {
  password: string;
  username: string;
}

const getAuth = (config: DotenvParseOutput): Auth => {
  const auth: Auth = {
    password: config.DFQW_DHIS2_PASSWORD,
    username: config.DFQW_DHIS2_USERNAME,
  };

  return auth;
};

export { Auth, getAuth };
