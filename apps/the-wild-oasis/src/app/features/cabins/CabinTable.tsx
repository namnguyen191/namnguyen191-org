import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Spinner } from '../../ui/Spinner';
import { Table } from '../../ui/Table';
import { useCabins } from './cabinQueryHooks';
import { CabinRow } from './CabinRow';

export const CabinTable: FC = () => {
  const { isLoadingCabins, cabins } = useCabins();
  const [searchParams] = useSearchParams();
  const filterSearchParams = searchParams.get('search');

  if (isLoadingCabins || !cabins?.length) {
    return <Spinner />;
  }

  let filteredCabins = cabins;
  if (filterSearchParams) {
    filteredCabins = cabins.filter((cabin) => {
      if (filterSearchParams === 'no-discount') {
        return !cabin.discount;
      }

      if (filterSearchParams === 'discount') {
        return cabin.discount;
      }

      return true;
    });
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
        data={filteredCabins}
        render={(cabin) => <CabinRow key={cabin.id} cabin={cabin} />}
      ></Table.Body>
    </Table>
  );
};
