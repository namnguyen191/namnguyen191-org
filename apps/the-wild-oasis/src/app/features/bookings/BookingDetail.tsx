import { FC } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useMoveBack } from '../../hooks/useMoveBack';
import { Button, buttonDefaultProps } from '../../ui/Button';
import { ButtonGroup } from '../../ui/ButtonGroup';
import { ButtonText } from '../../ui/ButtonText';
import { Heading } from '../../ui/Heading';
import { Row } from '../../ui/Row';
import { Spinner } from '../../ui/Spinner';
import { Tag } from '../../ui/Tag';
import { BookingDataBox } from './BookingDataBox';
import { useBookingDetail } from './bookingQueryHooks';

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

  if (isLoadingBooking) {
    return <Spinner />;
  }

  if (!booking || error) {
    return <span>Something went wrong, please try again later</span>;
  }

  const status = 'checked-in';

  const statusToTagName = {
    unconfirmed: 'blue',
    'checked-in': 'green',
    'checked-out': 'silver',
  };

  return (
    <>
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Booking #X</Heading>
          <Tag type={statusToTagName[status]}>{status.replace('-', ' ')}</Tag>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <ButtonGroup>
        <Button {...buttonDefaultProps} variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
};
