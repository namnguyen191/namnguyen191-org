import { FC } from 'react';

import { Button, buttonDefaultProps } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { CreateCabinForm } from './CreateCabinForm';

export const AddCabin: FC = () => {
  return (
    <Modal>
      <Modal.Open windowTargetId="createFormModal">
        <Button {...buttonDefaultProps}>Add new cabin</Button>
      </Modal.Open>
      <Modal.Window id="createFormModal">
        <CreateCabinForm />
      </Modal.Window>
    </Modal>
  );
};
