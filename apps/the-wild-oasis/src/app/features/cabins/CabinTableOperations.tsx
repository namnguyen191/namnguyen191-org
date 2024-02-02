import { ReactElement } from 'react';

import { Filter } from '../../ui/Filter';
import { SortBy, SortOption } from '../../ui/SortBy';
import { TableOperations } from '../../ui/TableOperations';

export const CabinTableOperations = (): ReactElement => {
  const cabinSortableFieldOptions: SortOption[] = [
    { label: 'Sort by name (Ascending)', value: 'name-asc' },
    { label: 'Sort by name (Descending)', value: 'name-des' },
    { label: 'Sort by discount (Highest)', value: 'discount-des' },
    { label: 'Sort by discount (Lowest)', value: 'discount-asc' },
    { label: 'Sort by max capacity (Biggest)', value: 'maxCapacity-des' },
    { label: 'Sort by max capacity (Smallest)', value: 'maxCapacity-asc' },
    { label: 'Sort by price (Highest)', value: 'regularPrice-des' },
    { label: 'Sort by price (Lowest)', value: 'regularPrice-asc' },
  ];
  return (
    <TableOperations>
      <Filter
        filterKey="search"
        options={[
          { label: 'All', value: 'all' },
          { label: 'No discount', value: 'no-discount' },
          { label: 'With discount', value: 'discount' },
        ]}
      />
      <SortBy options={cabinSortableFieldOptions} />
    </TableOperations>
  );
};
