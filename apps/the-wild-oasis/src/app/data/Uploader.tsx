import { isFuture, isPast, isToday } from 'date-fns';
import { ReactElement, useState } from 'react';

import { supabase } from '../services/supabase';
import { Button, buttonDefaultProps } from '../ui/Button';
import { subtractDates } from '../utils/helpers';
import { bookings } from './data-bookings';
import { cabins } from './data-cabins';
import { guests } from './data-guests';

// const originalSettings = {
//   minBookingLength: 3,
//   maxBookingLength: 30,
//   maxGuestsPerBooking: 10,
//   breakfastPrice: 15,
// };

const deleteGuests = async (): Promise<void> => {
  const { error } = await supabase.from('guests').delete().gt('id', 0);
  if (error) console.log(error.message);
};

const deleteCabins = async (): Promise<void> => {
  const { error } = await supabase.from('cabins').delete().gt('id', 0);
  if (error) console.log(error.message);
};

const deleteBookings = async (): Promise<void> => {
  const { error } = await supabase.from('bookings').delete().gt('id', 0);
  if (error) console.log(error.message);
};

const createGuests = async (): Promise<void> => {
  const { error } = await supabase.from('guests').insert(guests);
  if (error) console.log(error.message);
};

const createCabins = async (): Promise<void> => {
  const { error } = await supabase.from('cabins').insert(cabins);
  if (error) console.log(error.message);
};

const createBookings = async (): Promise<void> => {
  // Bookings need a guestId and a cabin_id. We can't tell Supabase IDs for each object, it will calculate them on its own. So it might be different for different people, especially after multiple uploads. Therefore, we need to first get all guestIds and cabinIds, and then replace the original IDs in the booking data with the actual ones from the DB
  const { data: guestsIds } = await supabase.from('guests').select('id').order('id');
  const allGuestIds = (guestsIds ?? []).map((cabin) => cabin.id);
  const { data: cabinsIds } = await supabase.from('cabins').select('id').order('id');
  const allCabinIds = (cabinsIds ?? []).map((cabin) => cabin.id);

  const finalBookings = bookings.map((booking) => {
    // Here relying on the order of cabins, as they don't have an ID yet
    const cabin = cabins.at(booking.cabin_id - 1);
    if (!cabin) {
      throw new Error('cabin is undefined');
    }
    const numNights = subtractDates(booking.end_date, booking.start_date);
    const cabinPrice = numNights * (cabin.regular_price - cabin.discount);
    const extrasPrice = booking.has_breakfast ? numNights * 15 * booking.num_guests : 0; // hardcoded breakfast price
    const totalPrice = cabinPrice + extrasPrice;

    let status;
    if (isPast(new Date(booking.end_date)) && !isToday(new Date(booking.end_date)))
      status = 'checked-out';
    if (isFuture(new Date(booking.start_date)) || isToday(new Date(booking.start_date)))
      status = 'unconfirmed';
    if (
      (isFuture(new Date(booking.end_date)) || isToday(new Date(booking.end_date))) &&
      isPast(new Date(booking.start_date)) &&
      !isToday(new Date(booking.start_date))
    )
      status = 'checked-in';

    return {
      ...booking,
      num_nights: numNights,
      cabin_price: cabinPrice,
      extra_price: extrasPrice,
      total_price: totalPrice,
      guest_id: allGuestIds.at(booking.guest_id - 1),
      cabin_id: allCabinIds.at(booking.cabin_id - 1),
      status,
    };
  });

  console.log(finalBookings);

  const { error } = await supabase.from('bookings').insert(finalBookings);
  if (error) console.log(error.message);
};

export const Uploader = (): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadAll = async (): Promise<void> => {
    setIsLoading(true);
    // Bookings need to be deleted FIRST
    await deleteBookings();
    await deleteGuests();
    await deleteCabins();

    // Bookings need to be created LAST
    await createGuests();
    await createCabins();
    await createBookings();

    setIsLoading(false);
  };

  const uploadBookings = async (): Promise<void> => {
    setIsLoading(true);
    await deleteBookings();
    await createBookings();
    setIsLoading(false);
  };

  return (
    <div
      style={{
        marginTop: 'auto',
        backgroundColor: '#e0e7ff',
        padding: '8px',
        borderRadius: '5px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <h3>SAMPLE DATA</h3>

      <Button {...buttonDefaultProps} onClick={uploadAll} disabled={isLoading}>
        Upload ALL
      </Button>

      <Button {...buttonDefaultProps} onClick={uploadBookings} disabled={isLoading}>
        Upload bookings ONLY
      </Button>
    </div>
  );
};
