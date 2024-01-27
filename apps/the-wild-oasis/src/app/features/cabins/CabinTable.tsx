import { FC } from 'react';

import { Spinner } from '../../ui/Spinner';
import { Table } from '../../ui/Table';
import { useCabins } from './cabinQueryHooks';
import { CabinRow } from './CabinRow';

export const CabinTable: FC = () => {
  const { isLoadingCabins, cabins } = useCabins();

  if (isLoadingCabins || !cabins?.length) {
    return <Spinner />;
  }

  return (
    <Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
      <Table.Header>
        <div>Cabin</div>
        <div>Capacity</div>
        <div>Price</div>
        <div>Discount</div>
        <div></div>
      </Table.Header>
      <Table.Body
        data={cabins}
        render={(cabin) => <CabinRow key={cabin.id} cabin={cabin} />}
      ></Table.Body>
    </Table>
  );
};
