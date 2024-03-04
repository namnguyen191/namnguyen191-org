import { delay } from '@namnguyen191/utils';

import { connection } from './connection.js';
import { generateId } from './ids.js';

export type JobEntity = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getJobTable = () => connection.table<JobEntity>('job');

export const countJobs = async (): Promise<number> => {
  const { count } = (await getJobTable().count({ count: '*' }).first()) as { count: number };
  return count;
};

export const getJobs = async (limit: number, offset: number): Promise<JobEntity[]> => {
  const query = getJobTable().select().orderBy('createdAt', 'desc');
  if (limit) {
    query.limit(limit);
  }
  if (offset) {
    query.offset(offset);
  }
  return await query;
};

export const getJobsByCompany = async (companyId: string): Promise<JobEntity[]> => {
  return await getJobTable().select().where({ companyId });
};

export const getJob = async (id: string): Promise<JobEntity | undefined> => {
  await delay(2000);
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
}): Promise<JobEntity> => {
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

export const deleteJob = async (id: string, companyId: string): Promise<JobEntity | null> => {
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
}: JobEntity): Promise<JobEntity | null> => {
  const job = await getJobTable().first().where({ id, companyId });
  if (!job) {
    return null;
  }
  const updatedFields = { title, description };
  await getJobTable().update(updatedFields).where({ id });
  return { ...job, ...updatedFields };
};
