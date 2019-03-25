const env = process.env;

interface Auth {
  password: string;
  username: string;
}

const getURL = (): string => {
  return env.DFQW_DHIS2_URL || "http://dhistest.kuunika.org:1414/dhis/api";
};

const getAuth = (): Auth => {
  const auth: Auth = {
    password: env.DFQW_DHIS2_PASSWORD || "username",
    username: env.DFQW_DHIS2_USERNAME || "password"
  };

  return auth;
};

export { Auth, getAuth, getURL };
