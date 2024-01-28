import { ReactElement } from 'react';

import { Filter } from '../../ui/Filter';
import { TableOperations } from '../../ui/TableOperations';

export const CabinTableOperations = (): ReactElement => {
  return (
    <TableOperations>
      <Filter
        filterKey="search"
        options={[
          { label: 'All', value: 'all' },
          { label: 'No discount', value: 'no-discount' },
          { label: 'With discount', value: 'discount' },
        ]}
      />
    </TableOperations>
  );
};
