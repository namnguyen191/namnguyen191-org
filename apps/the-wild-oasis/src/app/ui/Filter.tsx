import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { PAGINATION_PARAM } from './Pagination';

export const StyledFilter = styled.div`
  border: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem;
  display: flex;
  gap: 0.4rem;
`;

export const FilterButton = styled.button<{ active: boolean }>`
  background-color: var(--color-grey-0);
  border: none;

  ${(props): false | FlattenSimpleInterpolation =>
    props.active &&
    css`
      background-color: var(--color-brand-600);
      color: var(--color-brand-50);
    `}

  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.4rem;
  /* To give the same height as select */
  padding: 0.44rem 0.8rem;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-600);
    color: var(--color-brand-50);
  }
`;

export type FilterOption = { value: string; label: string };
export type FilterProps = {
  filterKey: string;
  options: FilterOption[];
};
export const Filter = (props: FilterProps): ReactElement => {
  const { options, filterKey } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const filterSearchParams = searchParams.get(filterKey);

  const isActive = (option: FilterOption): boolean => {
    if (!options[0]) {
      return false;
    }

    return filterSearchParams === option.value;
  };

  const selectFilter = (filterValue: string): void => {
    searchParams.set(filterKey, filterValue);

    if (searchParams.get(PAGINATION_PARAM)) {
      searchParams.set(PAGINATION_PARAM, '1');
    }

    setSearchParams(searchParams);
  };

  return (
    <StyledFilter>
      {options.map((option) => (
        <FilterButton
          key={option.value}
          onClick={() => selectFilter(option.value)}
          active={isActive(option)}
        >
          {option.label}
        </FilterButton>
      ))}
    </StyledFilter>
  );
};
