import { FC, useState } from 'react';

import { CabinTable } from '../features/cabins/CabinTable';
import { CreateCabinForm } from '../features/cabins/CreateCabinForm';
import { Button, buttonDefaultProps } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Row } from '../ui/Row';

export const Cabins: FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All cabins</Heading>
        <p>Filter / Sort</p>
      </Row>

      <Row>
        <CabinTable />

        <Button {...buttonDefaultProps} onClick={() => setShowForm(!showForm)}>
          Add new cabin
        </Button>
        {showForm && <CreateCabinForm />}
      </Row>
    </>
  );
};
