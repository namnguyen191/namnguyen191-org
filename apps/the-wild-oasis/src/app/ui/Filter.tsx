import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

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

  const isActive = (option: FilterOption, index: number): boolean => {
    if (!options[0]) {
      return false;
    }

    if (filterSearchParams === null && index === 0) {
      searchParams.set(filterKey, options[0].value);
      setSearchParams(searchParams);
      return true;
    }

    return filterSearchParams === option.value;
  };

  return (
    <StyledFilter>
      {options.map((option, i) => (
        <FilterButton
          key={option.value}
          onClick={() => {
            searchParams.set(filterKey, option.value);
            setSearchParams(searchParams);
          }}
          active={isActive(option, i)}
        >
          {option.label}
        </FilterButton>
      ))}
    </StyledFilter>
  );
};
