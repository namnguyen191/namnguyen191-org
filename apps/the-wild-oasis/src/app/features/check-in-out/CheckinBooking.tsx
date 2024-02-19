import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useMoveBack } from '../../hooks/useMoveBack';
import { Button, buttonDefaultProps } from '../../ui/Button';
import { ButtonGroup } from '../../ui/ButtonGroup';
import { ButtonText } from '../../ui/ButtonText';
import { Checkbox } from '../../ui/Checkbox';
import { Heading } from '../../ui/Heading';
import { Row } from '../../ui/Row';
import { Spinner } from '../../ui/Spinner';
import { formatCurrency } from '../../utils/helpers';
import { BookingDataBox } from '../bookings/BookingDataBox';
import { useBookingDetail } from '../bookings/bookingQueryHooks';
import { useSettings } from '../settings/settingQueryHooks';
import { BreakfastMutation, useCheckIn } from './checkinHooks';

const Box = styled.div`
  /* Box */
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem 4rem;
`;

export const CheckinBooking: FC = () => {
  const moveBack = useMoveBack();
  const params = useParams();
  const bookingId = params.id as string;
  const { booking, isLoadingBooking, error } = useBookingDetail({ id: bookingId });
  const { checkIn, isCheckingIn } = useCheckIn();
  const { settings, isLoadingSettings } = useSettings();
  const [confirmPaid, setConfirmPaid] = useState<boolean>(false);
  const [includeBreakfast, setIncludeBreakfast] = useState<boolean>(false);

  useEffect(() => {
    setConfirmPaid(!!booking?.has_paid);
    setIncludeBreakfast(!!booking?.has_breakfast);
  }, [booking?.has_paid, booking?.has_breakfast]);

  if (isLoadingBooking || isCheckingIn || isLoadingSettings) {
    return <Spinner />;
  }

  if (error || !booking || !settings) {
    return <span>Something went wrong please try again later!</span>;
  }

  const { guests: guest, total_price, has_paid, status, cabin_price } = booking;
  if (status === 'checked-in') {
    return <h4>This booking has already been checked-in</h4>;
  }

  const totalPrice = includeBreakfast ? cabin_price + settings.breakfast_price : total_price;

  const handleCheckin = (): void => {
    if (!confirmPaid) {
      return;
    }

    const breakfast: BreakfastMutation | undefined = includeBreakfast
      ? { has_breakfast: true, extra_price: settings.breakfast_price, total_price: totalPrice }
      : undefined;
    checkIn({ bookingId, breakfast });
  };

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Check in booking #{bookingId}</Heading>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <Box>
        <Checkbox
          onChange={() => {
            setIncludeBreakfast((oldValue) => !oldValue);
          }}
          checked={includeBreakfast}
          disabled={has_paid}
          id="include_breakfast"
        >
          Add breakfast for {formatCurrency(settings.breakfast_price)}
        </Checkbox>
      </Box>

      <Box>
        <Checkbox
          onChange={() => {
            setConfirmPaid((oldValue) => !oldValue);
          }}
          checked={confirmPaid}
          disabled={has_paid}
          id="confirm"
        >
          I confirm that {guest.full_name} has paid the total amount of {formatCurrency(totalPrice)}{' '}
          {includeBreakfast &&
            `(${formatCurrency(total_price)} + ${formatCurrency(settings.breakfast_price)})`}
        </Checkbox>
      </Box>

      <ButtonGroup>
        <Button {...buttonDefaultProps} onClick={handleCheckin} disabled={!confirmPaid}>
          Check in booking #{bookingId}
        </Button>
        <Button {...buttonDefaultProps} variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
};
