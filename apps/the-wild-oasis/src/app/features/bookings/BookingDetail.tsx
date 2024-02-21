import { FC } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useMoveBack } from '../../hooks/useMoveBack';
import { BookingStatus } from '../../services/supabase';
import { Button, buttonDefaultProps } from '../../ui/Button';
import { ButtonGroup } from '../../ui/ButtonGroup';
import { ButtonText } from '../../ui/ButtonText';
import { ConfirmDelete } from '../../ui/ConfirmDelete';
import { Heading } from '../../ui/Heading';
import { Modal } from '../../ui/Modal';
import { Row } from '../../ui/Row';
import { Spinner } from '../../ui/Spinner';
import { Tag } from '../../ui/Tag';
import { useCheckOut } from '../check-in-out/checkoutHooks';
import { BookingDataBox } from './BookingDataBox';
import { useBookingDetail, useDeleteBooking } from './bookingQueryHooks';

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`;

export const BookingDetail: FC = () => {
  const params = useParams();
  const bookingId = params.id as string;
  const { booking, isLoadingBooking, error } = useBookingDetail({ id: bookingId });
  const moveBack = useMoveBack();
  const { checkOut, isCheckingOut } = useCheckOut();
  const { deleteBooking, isDeletingBooking } = useDeleteBooking();

  if (isLoadingBooking) {
    return <Spinner />;
  }

  if (!booking || error) {
    return <span>Something went wrong, please try again later</span>;
  }

  const status: BookingStatus = 'checked-in';

  const statusToTagName: {
    [K in BookingStatus]: string;
  } = {
    unconfirmed: 'blue',
    'checked-in': 'green',
    'checked-out': 'silver',
  };

  return (
    <>
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Booking #{booking.id}</Heading>
          <Tag type={statusToTagName[status]}>{status.replace('-', ' ')}</Tag>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <ButtonGroup>
        <Button {...buttonDefaultProps} variation="secondary" onClick={moveBack}>
          Back
        </Button>
        {booking.status === 'checked-in' && (
          <Button
            {...buttonDefaultProps}
            disabled={isCheckingOut}
            onClick={() => checkOut(booking.id.toString())}
          >
            Check-out
          </Button>
        )}
        <Modal>
          <Modal.Open windowTargetId="confirmDeleteBookingModal">
            <Button {...buttonDefaultProps} disabled={isCheckingOut} variation="danger">
              Delete booking
            </Button>
          </Modal.Open>
          <Modal.Window id="confirmDeleteBookingModal">
            <ConfirmDelete
              resourceName="booking"
              disabled={isDeletingBooking}
              onConfirm={() => {
                deleteBooking(bookingId, {
                  onSuccess: () => moveBack(),
                });
              }}
            ></ConfirmDelete>
          </Modal.Window>
        </Modal>
      </ButtonGroup>
    </>
  );
};
