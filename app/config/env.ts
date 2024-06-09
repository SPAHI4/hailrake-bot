import envalid from 'envalid';

export const env = envalid.cleanEnv(process.env, {
  PG_URL: envalid.url(),
  BOT_TOKEN: envalid.str(),
  NODE_ENV: envalid.str({ choices: ['development', 'test', 'production'], default: 'development' }),
});
