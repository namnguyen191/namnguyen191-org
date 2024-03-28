import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { BookingWithGuestInfoAndCabinName } from '../../services/apiBookings';
import { Button, buttonDefaultProps } from '../../ui/Button';
import { Flag } from '../../ui/Flag';
import { Tag } from '../../ui/Tag';
import { CheckoutButton } from './CheckoutButton';

const StyledTodayItem = styled.li`
  display: grid;
  grid-template-columns: 9rem 2rem 1fr 7rem 9rem;
  gap: 1.2rem;
  align-items: center;

  font-size: 1.4rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:first-child {
    border-top: 1px solid var(--color-grey-100);
  }
`;

const Guest = styled.div`
  font-weight: 500;
`;

export type TodayItemProps = {
  activity: BookingWithGuestInfoAndCabinName;
};

export const TodayItem = (props: TodayItemProps): ReactElement => {
  const { activity } = props;
  const { status, guests, num_nights, id } = activity;

  return (
    <StyledTodayItem>
      {status === 'unconfirmed' && <Tag type="green">Arriving</Tag>}
      {status === 'checked-in' && <Tag type="blue">Departing</Tag>}

      <Flag src={guests.country_flag} alt={`Flag of ${guests.nationality}`} />
      <Guest>{guests.full_name}</Guest>
      <div>{num_nights} nights</div>

      {status === 'unconfirmed' && (
        <Button {...buttonDefaultProps} variation="primary" as={Link} to={`/check-in/${id}`}>
          Check in
        </Button>
      )}
      {status === 'checked-in' && <CheckoutButton></CheckoutButton>}
    </StyledTodayItem>
  );
};
