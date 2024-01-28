import { FC } from 'react';

import { AddCabin } from '../features/cabins/AddCabin';
import { CabinTable } from '../features/cabins/CabinTable';
import { CabinTableOperations } from '../features/cabins/CabinTableOperations';
import { Heading } from '../ui/Heading';
import { Row } from '../ui/Row';

export const Cabins: FC = () => {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All cabins</Heading>
        <CabinTableOperations />
      </Row>

      <Row>
        <CabinTable />
        <AddCabin />
      </Row>
    </>
  );
};
