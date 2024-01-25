import { FC, useState } from 'react';

import { Button, buttonDefaultProps } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { CreateCabinForm } from './CreateCabinForm';

export const AddCabin: FC = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  return (
    <div>
      {' '}
      <Button {...buttonDefaultProps} onClick={() => setIsOpenModal(!isOpenModal)}>
        Add new cabin
      </Button>
      {isOpenModal && (
        <Modal onClose={() => setIsOpenModal(false)}>
          <CreateCabinForm onCloseModal={() => setIsOpenModal(false)} />
        </Modal>
      )}
    </div>
  );
};
