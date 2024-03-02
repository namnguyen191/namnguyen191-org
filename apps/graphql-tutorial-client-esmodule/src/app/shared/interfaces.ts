export type Company = {
  id: string;
  name: string;
  description?: string;
};

export type Job = {
  id: string;
  company?: Company;
  title: string;
  description: string;
  date: string;
};
