// import { FC } from 'react';

// import { Filter } from '../../ui/Filter';
// import SortBy from '../../ui/SortBy';
// import { TableOperations } from '../../ui/TableOperations';

// export const BookingTableOperations: FC = () => {
//   return (
//     <TableOperations>
//       <Filter
//         filterField="status"
//         options={[
//           { value: 'all', label: 'All' },
//           { value: 'checked-out', label: 'Checked out' },
//           { value: 'checked-in', label: 'Checked in' },
//           { value: 'unconfirmed', label: 'Unconfirmed' },
//         ]}
//       />

//       <SortBy
//         options={[
//           { value: 'startDate-desc', label: 'Sort by date (recent first)' },
//           { value: 'startDate-asc', label: 'Sort by date (earlier first)' },
//           {
//             value: 'totalPrice-desc',
//             label: 'Sort by amount (high first)',
//           },
//           { value: 'totalPrice-asc', label: 'Sort by amount (low first)' },
//         ]}
//       />
//     </TableOperations>
//   );
// };

import { FC } from 'react';

export const BookingTableOperations: FC = () => {
  return <div>BookingTableOperations work!</div>;
};
