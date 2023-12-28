import { MovieData } from './interfaces';

const BASED_URL = 'http://www.omdbapi.com';
const API_KEY = '601d0cce';

export type APIResponse = {
  Response: boolean;
  Error?: string;
};

export type APISearchResponse = APIResponse & {
  Search: MovieData[];
  totalResults: number;
};

export type APIFindByIdResponse = MovieData;

export const getMovieById = async (id: string): Promise<APIFindByIdResponse> => {
  const res = await fetch(`${BASED_URL}?apikey=${API_KEY}&i=${id}`);
  return res.json();
};

export const findMovieByName = async (name: string): Promise<APISearchResponse> => {
  const res = await fetch(`${BASED_URL}?apikey=${API_KEY}&s=${name}`);
  return res.json();
};
