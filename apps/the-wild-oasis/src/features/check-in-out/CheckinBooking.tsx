// import { FC } from 'react';
// import styled from 'styled-components';

// import { useMoveBack } from '../../hooks/useMoveBack';
// import { Button } from '../../ui/Button';
// import { ButtonGroup } from '../../ui/ButtonGroup';
// import { ButtonText } from '../../ui/ButtonText';
// import Heading from '../../ui/Heading';
// import Row from '../../ui/Row';
// import { BookingDataBox } from '../bookings/BookingDataBox';

// const Box = styled.div`
//   /* Box */
//   background-color: var(--color-grey-0);
//   border: 1px solid var(--color-grey-100);
//   border-radius: var(--border-radius-md);
//   padding: 2.4rem 4rem;
// `;

// export const CheckinBooking: FC = () => {
//   const moveBack = useMoveBack();

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const booking = {} as any;

//   const { id: bookingId } = booking;

//   const handleCheckin = (): void => {
//     // TODO:
//   };

//   return (
//     <>
//       <Row type="horizontal">
//         <Heading as="h1">Check in booking #{bookingId}</Heading>
//         <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
//       </Row>

//       <BookingDataBox booking={booking} />

//       <ButtonGroup>
//         <Button onClick={handleCheckin}>Check in booking #{bookingId}</Button>
//         <Button variation="secondary" onClick={moveBack}>
//           Back
//         </Button>
//       </ButtonGroup>
//     </>
//   );
// };

import { FC } from 'react';

export const CheckinBooking: FC = () => {
  return <div>CheckinBooking work!</div>;
};
