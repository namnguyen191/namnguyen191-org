import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FilterOperation } from '../../services/apiBookings';
import { BookingRow as BookingRowType } from '../../services/supabase';
import { Empty } from '../../ui/Empty';
import { Menus } from '../../ui/Menus';
import { SortByParamKey, SortOrderParamKey } from '../../ui/SortBy';
import { Spinner } from '../../ui/Spinner';
import { Table } from '../../ui/Table';
import { useBookings } from './bookingQueryHooks';
import { BookingRow } from './BookingRow';
import { StatusFilterKey, StatusFilterValue } from './BookingTableOperations';

export const BookingTable: FC = () => {
  const [searchParams] = useSearchParams();

  const statusFilter: StatusFilterValue | null = searchParams.get(
    StatusFilterKey
  ) as StatusFilterValue;

  const filters: FilterOperation[] =
    statusFilter && statusFilter !== 'all' ? [{ key: 'status', value: statusFilter }] : [];
  const { bookings, isLoadingBookings } = useBookings(filters);

  let bookingsWithOperation = bookings ?? [];

  const sortBy = searchParams.get(SortByParamKey);
  const sortOrder = searchParams.get(SortOrderParamKey);
  if (sortBy && sortOrder) {
    const sortByParamsExist = (
      param: unknown,
      booking: BookingRowType
    ): param is keyof typeof booking => {
      return Object.prototype.hasOwnProperty.call(booking, sortBy);
    };
    bookingsWithOperation = bookingsWithOperation.sort((bookingA, bookingB) => {
      let result = 0;
      if (sortByParamsExist(sortBy, bookingA)) {
        if ((bookingA[sortBy] ?? 0) > (bookingB[sortBy] ?? 0)) {
          result = 1;
        } else {
          result = -1;
        }
      }
      if (sortOrder === 'des') {
        result = -1 * result;
      }

      return result;
    });
  }

  if (isLoadingBookings) {
    return <Spinner />;
  }

  if (bookingsWithOperation.length === 0) {
    return <Empty resourceName="bookings" />;
  }

  return (
    <Menus>
      <Table columns="0.6fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
        <Table.Header>
          <div>Cabin</div>
          <div>Guest</div>
          <div>Dates</div>
          <div>Status</div>
          <div>Amount</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={bookingsWithOperation}
          render={(booking) => <BookingRow key={booking.id} booking={booking} />}
        />
      </Table>
    </Menus>
  );
};
