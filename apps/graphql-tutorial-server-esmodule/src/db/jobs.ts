import { connection } from './connection.js';
import { generateId } from './ids.js';

export type Job = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getJobTable = () => connection.table<Job>('job');

export const countJobs = async (): Promise<number> => {
  const { count } = (await getJobTable().count({ count: '*' }).first()) as { count: number };
  return count;
};

export const getJobs = async (limit: number, offset: number): Promise<Job[]> => {
  const query = getJobTable().select().orderBy('createdAt', 'desc');
  if (limit) {
    query.limit(limit);
  }
  if (offset) {
    query.offset(offset);
  }
  return await query;
};

export const getJobsByCompany = async (companyId: string): Promise<Job[]> => {
  return await getJobTable().select().where({ companyId });
};

export const getJob = async (id: string): Promise<Job | undefined> => {
  return await getJobTable().first().where({ id });
};

export const createJob = async ({
  companyId,
  title,
  description,
}: {
  companyId: string;
  title: string;
  description: string;
}): Promise<Job> => {
  const job = {
    id: generateId(),
    companyId,
    title,
    description,
    createdAt: new Date().toISOString(),
  };
  await getJobTable().insert(job);
  return job;
};

export const deleteJob = async (id: string, companyId: string): Promise<Job | null> => {
  const job = await getJobTable().first().where({ id, companyId });
  if (!job) {
    return null;
  }
  await getJobTable().delete().where({ id });
  return job;
};

export const updateJob = async ({
  id,
  companyId,
  title,
  description,
}: Job): Promise<Job | null> => {
  const job = await getJobTable().first().where({ id, companyId });
  if (!job) {
    return null;
  }
  const updatedFields = { title, description };
  await getJobTable().update(updatedFields).where({ id });
  return { ...job, ...updatedFields };
};
