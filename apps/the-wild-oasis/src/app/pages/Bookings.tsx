import { FC } from 'react';

import { BookingTable } from '../features/bookings/BookingTable';
import { BookingTableOperations } from '../features/bookings/BookingTableOperations';
import { Heading } from '../ui/Heading';
import { Row } from '../ui/Row';

export const Bookings: FC = () => {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All bookings</Heading>
        <BookingTableOperations />
      </Row>

      <Row>
        <BookingTable />
      </Row>
    </>
  );
};
