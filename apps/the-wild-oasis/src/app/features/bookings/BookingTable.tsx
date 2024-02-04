import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FilterOperation } from '../../services/apiBookings';
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
  const sortBy = searchParams.get(SortByParamKey);
  const sortOrder = searchParams.get(SortOrderParamKey);

  const { bookings, isLoadingBookings } = useBookings({
    filters,
    sort: sortBy ? { field: sortBy, asc: sortOrder === 'asc' } : undefined,
  });

  if (isLoadingBookings) {
    return <Spinner />;
  }

  if (!bookings || bookings.length === 0) {
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
          data={bookings}
          render={(booking) => <BookingRow key={booking.id} booking={booking} />}
        />
      </Table>
    </Menus>
  );
};
