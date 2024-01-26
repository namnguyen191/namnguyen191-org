import { FC } from 'react';
import { HiPencil, HiSquare2Stack, HiTrash } from 'react-icons/hi2';
import styled from 'styled-components';

import { Cabin } from '../../services/apiCabins';
import { ConfirmDelete } from '../../ui/ConfirmDelete';
import { Modal } from '../../ui/Modal';
import { formatCurrency } from '../../utils/helpers';
import { useDeleteCabin, useDuplicateCabin } from './cabinQueryHooks';
import { CreateCabinForm } from './CreateCabinForm';

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.6fr 1.8fr 2.2fr 1fr 1fr 1fr;
  column-gap: 2.4rem;
  align-items: center;
  padding: 1.4rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const Img = styled.img`
  display: block;
  width: 6.4rem;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  object-position: center;
  transform: scale(1.5) translateX(-7px);
`;

// const CabinContainer = styled.div`
//   font-size: 1.6rem;
//   font-weight: 600;
//   color: var(--color-grey-600);
//   font-family: 'Sono';
// `;

const Price = styled.div`
  font-family: 'Sono';
  font-weight: 600;
`;

const Discount = styled.div`
  font-family: 'Sono';
  font-weight: 500;
  color: var(--color-green-700);
`;

export type CabinRowProps = {
  cabin: Cabin;
};
export const CabinRow: FC<CabinRowProps> = ({ cabin }) => {
  const { id, maxCapacity, regularPrice, discount, image } = cabin;

  const { deleteCabin, isDeletingCabin } = useDeleteCabin();
  const { duplicateCabin, isDuplicatingCabin } = useDuplicateCabin();

  const handleDuplicateCabin = (): void => {
    const { id: duplicatedObjectId, ...cabinWithoutId } = cabin;
    duplicateCabin(cabinWithoutId);
  };

  return (
    <TableRow role="row">
      <Img src={image ?? ''} />
      <div>Fits up to {maxCapacity} guests</div>
      <Price>{formatCurrency(regularPrice ?? 0)}</Price>
      {discount ? <Discount>{formatCurrency(discount)}</Discount> : <span>&mdash;</span>}
      <div>
        <button onClick={() => handleDuplicateCabin()} disabled={isDuplicatingCabin}>
          <HiSquare2Stack />
        </button>
        <Modal>
          <Modal.Open windowTargetId="editCarbinForm">
            <button>
              <HiPencil />
            </button>
          </Modal.Open>
          <Modal.Window id="editCarbinForm">
            <CreateCabinForm cabin={cabin} />
          </Modal.Window>
        </Modal>
        <Modal>
          <Modal.Open windowTargetId="deleteCabinConfirmation">
            <button disabled={isDeletingCabin}>
              <HiTrash />
            </button>
          </Modal.Open>
          <Modal.Window id="deleteCabinConfirmation">
            <ConfirmDelete resourceName="cabin" onConfirm={() => deleteCabin(id)}></ConfirmDelete>
          </Modal.Window>
        </Modal>
      </div>
    </TableRow>
  );
};
