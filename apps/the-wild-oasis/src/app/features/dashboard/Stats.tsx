import { ReactElement } from 'react';
import {
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
} from 'react-icons/hi2';

import { BookingWithGuestLastName } from '../../services/apiBookings';
import { BookingRow } from '../../services/supabase';
import { Stat } from './Stat';

export type StatsProps = {
  bookings: Pick<BookingRow, 'created_at' | 'total_price' | 'extra_price'>[];
  confirmedStays: BookingWithGuestLastName[];
  numOfDays: number;
  numOfCabins: number;
};

export const Stats = (props: StatsProps): ReactElement => {
  const { bookings, confirmedStays, numOfDays, numOfCabins } = props;
  const numBookings = bookings.length;
  const sales = bookings.reduce((acc, cur) => acc + cur.total_price, 0);
  const checkins = confirmedStays.length;
  const occupationRate =
    Math.round(
      (confirmedStays.reduce((acc, cur) => acc + cur.num_nights, 0) / (numOfDays * numOfCabins)) *
        100
    ) + '%';

  return (
    <>
      <Stat title="Bookings" color="blue" icon={<HiOutlineBriefcase />} value={numBookings} />
      <Stat title="Sales" color="green" icon={<HiOutlineBanknotes />} value={sales} />
      <Stat title="Check ins" color="indigo" icon={<HiOutlineCalendarDays />} value={checkins} />
      <Stat
        title="Occupancy rate"
        color="yellow"
        icon={<HiOutlineChartBar />}
        value={occupationRate}
      />
    </>
  );
};
