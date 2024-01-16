// import { FC } from 'react';

// import { Menus } from '../../ui/Menus';
// import { Table } from '../../ui/Table';
// import { BookingRow } from './BookingRow';

// export const BookingTable: FC = () => {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const bookings: any[] = [];

//   return (
//     <Menus>
//       <Table columns="0.6fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
//         <Table.Header>
//           <div>Cabin</div>
//           <div>Guest</div>
//           <div>Dates</div>
//           <div>Status</div>
//           <div>Amount</div>
//           <div></div>
//         </Table.Header>

//         <Table.Body
//           data={bookings}
//           render={(booking) => <BookingRow key={booking.id} booking={booking} />}
//         />
//       </Table>
//     </Menus>
//   );
// };

import { FC } from 'react';

export const BookingTable: FC = () => {
  return <div>BookingTable work!</div>;
};
