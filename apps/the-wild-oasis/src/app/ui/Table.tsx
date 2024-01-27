import { createContext, FC, PropsWithChildren, ReactElement, useContext } from 'react';
import styled from 'styled-components';

export const StyledTable = styled.div`
  border: 1px solid var(--color-grey-200);

  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

const CommonRow = styled.div<{ columns: string }>`
  display: grid;
  grid-template-columns: ${(props): string => props.columns};
  column-gap: 2.4rem;
  align-items: center;
  transition: none;
`;

export const StyledHeader = styled(CommonRow)`
  padding: 1.6rem 2.4rem;

  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
`;

export const StyledRow = styled(CommonRow)`
  padding: 1.2rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

export const StyledBody = styled.section`
  margin: 0.4rem 0;
`;

export const Footer = styled.footer`
  background-color: var(--color-grey-50);
  display: flex;
  justify-content: center;
  padding: 1.2rem;

  /* This will hide the footer when it contains no child elements. Possible thanks to the parent selector :has 🎉 */
  &:not(:has(*)) {
    display: none;
  }
`;

export const Empty = styled.p`
  font-size: 1.6rem;
  font-weight: 500;
  text-align: center;
  margin: 2.4rem;
`;

type TableContextVal = {
  columns: string;
};
const TableContext = createContext<TableContextVal>({ columns: '' });

const Header: FC<PropsWithChildren> = ({ children }) => {
  const { columns } = useContext(TableContext);
  return (
    <StyledHeader role="row" columns={columns} as="header">
      {children}
    </StyledHeader>
  );
};

const Row: FC<PropsWithChildren> = ({ children }) => {
  const { columns } = useContext(TableContext);
  return (
    <StyledRow role="row" columns={columns}>
      {children}
    </StyledRow>
  );
};

const Body = <T,>(props: { data: T[]; render: (t: T) => ReactElement }): ReactElement => {
  const { data, render } = props;
  return <StyledBody>{data.map(render)}</StyledBody>;
};

export type TableProps = {
  columns: string;
};

const Table: FC<PropsWithChildren<TableProps>> & {
  Header: typeof Header;
  Row: typeof Row;
  Body: typeof Body;
} = ({ children, columns }) => {
  return (
    <TableContext.Provider value={{ columns }}>
      <StyledTable role="table">{children}</StyledTable>
    </TableContext.Provider>
  );
};

Table.Header = Header;
Table.Row = Row;
Table.Body = Body;

export { Table };
