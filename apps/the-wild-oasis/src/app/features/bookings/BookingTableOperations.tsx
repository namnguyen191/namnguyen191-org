import { FC } from 'react';

import { Filter } from '../../ui/Filter';
import { SortBy } from '../../ui/SortBy';
import { TableOperations } from '../../ui/TableOperations';

export const StatusFilterKey = 'status';

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'checked-out', label: 'Checked out' },
  { value: 'checked-in', label: 'Checked in' },
  { value: 'unconfirmed', label: 'Unconfirmed' },
] as const;

export type StatusFilterValue = (typeof statusFilterOptions)[number]['value'];

export const BookingTableOperations: FC = () => {
  return (
    <TableOperations>
      <Filter filterKey="status" options={[...statusFilterOptions]} />

      <SortBy
        options={[
          { value: 'start_date-des', label: 'Sort by date (recent first)' },
          { value: 'start_date-asc', label: 'Sort by date (earlier first)' },
          {
            value: 'total_price-des',
            label: 'Sort by amount (high first)',
          },
          { value: 'total_price-asc', label: 'Sort by amount (low first)' },
        ]}
      />
    </TableOperations>
  );
};
