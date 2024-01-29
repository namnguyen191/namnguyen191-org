import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Cabin } from '../../services/apiCabins';
import { Spinner } from '../../ui/Spinner';
import { Table } from '../../ui/Table';
import { useCabins } from './cabinQueryHooks';
import { CabinRow } from './CabinRow';

export const CabinTable: FC = () => {
  const { isLoadingCabins, cabins } = useCabins();
  const [searchParams] = useSearchParams();

  if (isLoadingCabins || !cabins?.length) {
    return <Spinner />;
  }

  let cabinsWithOperation = cabins;
  const filterSearchParams = searchParams.get('search');
  if (filterSearchParams) {
    cabinsWithOperation = cabins.filter((cabin) => {
      if (filterSearchParams === 'no-discount') {
        return !cabin.discount;
      }

      if (filterSearchParams === 'discount') {
        return cabin.discount;
      }

      return true;
    });
  }

  const sortByParams = searchParams.get('sortBy');
  const sortOrderParams = searchParams.get('sortOrder');
  if (sortByParams && sortOrderParams) {
    const sortByParamsExist = (param: unknown, cabin: Cabin): param is keyof Cabin => {
      return Object.prototype.hasOwnProperty.call(cabin, sortByParams);
    };
    cabinsWithOperation = cabinsWithOperation.sort((cabinA, cabinB) => {
      let result = 0;
      if (sortByParamsExist(sortByParams, cabinA)) {
        if (cabinA[sortByParams] > cabinB[sortByParams]) {
          result = 1;
        } else {
          result = -1;
        }
      }
      if (sortOrderParams === 'des') {
        result = -1 * result;
      }
      return result;
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
        data={cabinsWithOperation}
        render={(cabin) => <CabinRow key={cabin.id} cabin={cabin} />}
      ></Table.Body>
    </Table>
  );
};
