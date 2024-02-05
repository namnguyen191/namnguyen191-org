import { MouseEventHandler, ReactElement } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { PAGE_SIZE } from '../utils/global-const';

export const StyledPagination = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const P = styled.p`
  font-size: 1.4rem;
  margin-left: 0.8rem;

  & span {
    font-weight: 600;
  }
`;

export const Buttons = styled.div`
  display: flex;
  gap: 0.6rem;
`;

export const PaginationButton = styled.button<{ active?: boolean }>`
  background-color: ${(props): ' var(--color-brand-600)' | 'var(--color-grey-50)' =>
    props.active ? ' var(--color-brand-600)' : 'var(--color-grey-50)'};
  color: ${(props): ' var(--color-brand-50)' | 'inherit' =>
    props.active ? ' var(--color-brand-50)' : 'inherit'};
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.4rem;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  transition: all 0.3s;

  &:has(span:last-child) {
    padding-left: 0.4rem;
  }

  &:has(span:first-child) {
    padding-right: 0.4rem;
  }

  & svg {
    height: 1.8rem;
    width: 1.8rem;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-brand-600);
    color: var(--color-brand-50);
  }
`;

export type PaginationProps = {
  totalCount: number;
};

export const PAGINATION_PARAM = 'page';

export const Pagination = (props: PaginationProps): ReactElement => {
  const { totalCount } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get(PAGINATION_PARAM)
    ? 1
    : Number(searchParams.get(PAGINATION_PARAM));

  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  const prevPage: MouseEventHandler<HTMLButtonElement> = () => {
    if (currentPage === 1) {
      return;
    }
    const newPage = currentPage - 1;
    searchParams.set(PAGINATION_PARAM, newPage.toString());
    setSearchParams(searchParams);
  };

  const nextPage: MouseEventHandler<HTMLButtonElement> = () => {
    if (currentPage === pageCount) {
      return;
    }
    const newPage = currentPage + 1;
    searchParams.set(PAGINATION_PARAM, newPage.toString());
    setSearchParams(searchParams);
  };

  return (
    <StyledPagination>
      <P>
        Showing <span>{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
        <span>{currentPage === pageCount ? totalCount : currentPage * PAGE_SIZE}</span> of{' '}
        <span>{totalCount}</span> results
      </P>

      {pageCount > 1 && (
        <Buttons>
          <PaginationButton onClick={prevPage} disabled={currentPage === 1}>
            <HiChevronLeft /> <span>Previous</span>
          </PaginationButton>

          <PaginationButton onClick={nextPage} disabled={currentPage === pageCount}>
            <span>Next</span>
            <HiChevronRight />
          </PaginationButton>
        </Buttons>
      )}
    </StyledPagination>
  );
};
