import 'dotenv/config';

const required = (key) => {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
  return process.env[key];
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: required('MONGODB_URI'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  accessSecret: required('JWT_ACCESS_SECRET'),
  refreshSecret: required('JWT_REFRESH_SECRET'),
  accessTtl: '15m',
  refreshTtlMs: 7 * 24 * 60 * 60 * 1000,
};
