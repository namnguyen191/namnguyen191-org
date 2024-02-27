import { connection } from './connection.js';

export type User = {
  id: string;
  companyId: string;
  email: string;
  password: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getUserTable = () => connection.table<User>('user');

export const getUser = async (id: string): Promise<User | undefined> => {
  return await getUserTable().first().where({ id });
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  return await getUserTable().first().where({ email });
};
