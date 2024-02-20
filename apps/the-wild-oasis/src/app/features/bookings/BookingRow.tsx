import { format, isToday } from 'date-fns';
import { FC } from 'react';
import { BiBell } from 'react-icons/bi';
import { HiArrowUpOnSquare, HiEye } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  BookingRow as BookingRowType,
  BookingStatus,
  CabinRow,
  GuestRow,
} from '../../services/supabase';
import { Menus } from '../../ui/Menus';
import { Table } from '../../ui/Table';
import { Tag } from '../../ui/Tag';
import { formatCurrency } from '../../utils/helpers';
import { formatDistanceFromNow } from '../../utils/helpers';
import { useCheckOut } from '../check-in-out/checkoutHooks';

const Cabin = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: 'Sono';
`;

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & span:first-child {
    font-weight: 500;
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
  }
`;

const Amount = styled.div`
  font-family: 'Sono';
  font-weight: 500;
`;

// eslint-disable-next-line
export const BookingRow: FC<{
  booking: BookingRowType & {
    guests: Pick<GuestRow, 'full_name' | 'email'>;
    cabins: Pick<CabinRow, 'name'>;
  };
}> = ({
  booking: {
    id,
    start_date,
    end_date,
    num_nights,
    total_price,
    status,
    guests: { full_name: guest_name, email },
    cabins: { name: cabinName },
  },
}) => {
  const navigate = useNavigate();
  const { checkOut, isCheckingOut } = useCheckOut();

  const statusToTagName: {
    [K in BookingStatus]: string;
  } = {
    unconfirmed: 'blue',
    'checked-in': 'green',
    'checked-out': 'silver',
  };

  const onCheckOutClick = (bookingId: string): void => {
    checkOut(bookingId);
  };

  return (
    <Table.Row>
      <Cabin>{cabinName}</Cabin>

      <Stacked>
        <span>{guest_name}</span>
        <span>{email}</span>
      </Stacked>

      <Stacked>
        <span>
          {isToday(new Date(start_date)) ? 'Today' : formatDistanceFromNow(start_date)} &rarr;{' '}
          {num_nights} night stay
        </span>
        <span>
          {format(new Date(start_date), 'MMM dd yyyy')} &mdash;{' '}
          {format(new Date(end_date), 'MMM dd yyyy')}
        </span>
      </Stacked>

      <Tag type={statusToTagName[status as 'unconfirmed']}>{status.replace('-', ' ')}</Tag>

      <Amount>{formatCurrency(total_price)}</Amount>

      <Menus>
        <Menus.Toggle id={id.toString()}></Menus.Toggle>
        <Menus.Menu>
          <Menus.List id={id.toString()}>
            <Menus.Button icon={<HiEye />} onClick={() => navigate(`/bookings/${id}`)}>
              View details
            </Menus.Button>
            {status === 'unconfirmed' && (
              <Menus.Button icon={<BiBell />} onClick={() => navigate(`/checkin/${id}`)}>
                Check-In
              </Menus.Button>
            )}
            {status === 'checked-in' && (
              <Menus.Button
                disabled={isCheckingOut}
                onClick={() => onCheckOutClick(`${id}`)}
                icon={<HiArrowUpOnSquare />}
              >
                Check-Out
              </Menus.Button>
            )}
          </Menus.List>
        </Menus.Menu>
      </Menus>
    </Table.Row>
  );
};
