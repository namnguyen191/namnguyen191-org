import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Select } from './Select';

export const SortBy = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();

  const cabinSortableFieldOptions = [
    { label: 'Sort by name (Ascending)', value: 'name-asc' },
    { label: 'Sort by name (Descending)', value: 'name-des' },
    { label: 'Sort by discount (Highest)', value: 'discount-des' },
    { label: 'Sort by discount (Lowest)', value: 'discount-asc' },
    { label: 'Sort by max capacity (Biggest)', value: 'maxCapacity-des' },
    { label: 'Sort by max capacity (Smallest)', value: 'maxCapacity-asc' },
    { label: 'Sort by price (Highest)', value: 'regularPrice-des' },
    { label: 'Sort by price (Lowest)', value: 'regularPrice-asc' },
  ];

  const handleOnSort = (sortByValue: string): void => {
    const sortMeta = sortByValue.split('-');
    const sortBy = sortMeta[0];
    const sortOrder = sortMeta[1];

    if (!sortBy || !sortOrder) {
      console.log('Invalid sort by syntax for cabin');
      return;
    }

    searchParams.set('sortBy', sortBy);
    searchParams.set('sortOrder', sortOrder);
    setSearchParams(searchParams);
  };

  return <Select options={cabinSortableFieldOptions} defaultLabel="Sort" onChange={handleOnSort} />;
};
