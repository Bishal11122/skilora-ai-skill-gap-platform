import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export default {
  PORT,
  NODE_ENV,
  CLIENT_URL,
};
