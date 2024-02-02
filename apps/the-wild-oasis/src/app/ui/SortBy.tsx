import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Select } from './Select';

export type SortOption = {
  label: string;
  value: `${string}-${string}`;
};
export type SortByProps = {
  options: SortOption[];
  label?: string;
};
export const SortBy = (props: SortByProps): ReactElement => {
  const { options, label = 'Sort' } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const handleOnSort = (sortByValue: string): void => {
    const sortMeta = sortByValue.split('-');
    const sortBy = sortMeta[0];
    const sortOrder = sortMeta[1];

    if (!sortBy || !sortOrder) {
      console.log('Invalid sort by syntax');
      return;
    }

    searchParams.set('sortBy', sortBy);
    searchParams.set('sortOrder', sortOrder);
    setSearchParams(searchParams);
  };

  return <Select options={options} defaultLabel={label} onChange={handleOnSort} />;
};
