import { supabase } from './supabase';

export type Cabin = {
  name: string | null;
  max_capacity: number | null;
  regular_price: number | null;
  discount: number | null;
  description: string | null;
  image: string | null;
};

export const getCabins = async (): Promise<Cabin[]> => {
  const { data: cabins, error } = await supabase.from('cabins').select('*');

  if (error) {
    console.error('Could not get cabins');
    throw new Error(error.message);
  }

  return cabins ?? [];
};
