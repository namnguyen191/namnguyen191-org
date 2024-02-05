import { PAGE_SIZE } from '../utils/global-const';
import { getToday } from '../utils/helpers';
import { BookingRow, supabase } from './supabase';

export type FilterOperation = {
  operation?: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  key: string;
  value: string | number | boolean;
};

export type SortOperation = {
  field: string;
  asc?: boolean;
};

export type PaginationOperation = {
  page: number;
};

export const getBookings = async (args: {
  filters?: FilterOperation[];
  sort?: SortOperation;
  pagination?: PaginationOperation;
}): Promise<{
  bookings: BookingRow[];
  count: number;
}> => {
  const { filters, sort, pagination } = args;
  const query = supabase
    .from('bookings')
    .select('*, guests(full_name, email), cabins(name)', { count: 'exact' });
  if (filters?.length) {
    for (const filter of filters) {
      if (typeof query[filter.operation ?? 'eq'] === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (query as unknown as any)[filter.operation ?? 'eq'](filter.key, filter.value);
      }
    }
  }

  if (sort) {
    query.order(sort.field, {
      ascending: sort.asc,
    });
  }

  if (pagination) {
    const from = (pagination.page - 1) * PAGE_SIZE;
    const to = pagination.page * PAGE_SIZE;
    query.range(from, to);
  }

  const { data: bookings, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error('Booking not found');
  }

  return { bookings, count: count ?? 0 };
};

export const getBookingById = async (id: string): Promise<BookingRow> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cabins(*), guests(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    throw new Error('Booking not found');
  }

  return data;
};

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
export const getBookingsAfterDate = async (
  date: string
): Promise<Pick<BookingRow, 'created_at' | 'total_price' | 'extra_price'>[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('created_at, total_price, extra_price')
    .gte('created_at', date)
    .lte('created_at', getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }

  return data;
};

// Returns all STAYS that are were created after the given date
export type BookingWithGuestLastName = BookingRow & { guests: unknown };
export const getStaysAfterDate = async (date: string): Promise<BookingWithGuestLastName[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, guests(full_name)')
    .gte('start_date', date)
    .lte('start_date', getToday());

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }

  return data;
};

// Activity means that there is a check in or a check out today
export const getStaysTodayActivity = async (): Promise<BookingRow[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, guests(full_name, nationality, country_flag)')
    .or(
      `and(status.eq.unconfirmed,start_date.eq.${getToday()}),and(status.eq.checked-in,end_date.eq.${getToday()})`
    )
    .order('created_at');

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }
  return data;
};

export const updateBooking = async (id: string, obj: Partial<BookingRow>): Promise<BookingRow> => {
  const { data, error } = await supabase
    .from('bookings')
    .update(obj)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('Booking could not be updated');
  }
  return data;
};

export const deleteBooking = async (id: string): Promise<void> => {
  // REMEMBER RLS POLICIES
  const { error } = await supabase.from('bookings').delete().eq('id', id);

  if (error) {
    console.error(error);
    throw new Error('Booking could not be deleted');
  }
};
