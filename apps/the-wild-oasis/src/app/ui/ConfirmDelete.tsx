import { FC } from 'react';
import styled from 'styled-components';

import { Button, buttonDefaultProps } from './Button';
import { Heading } from './Heading';

const StyledConfirmDelete = styled.div`
  width: 40rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & p {
    color: var(--color-grey-500);
    margin-bottom: 1.2rem;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

export type ConfirmDeleteProps = {
  resourceName: string;
  onConfirm: () => void;
  disabled?: boolean;
  onCloseModal?: () => void;
};
export const ConfirmDelete: FC<ConfirmDeleteProps> = ({
  resourceName,
  disabled,
  onConfirm,
  onCloseModal,
}) => {
  return (
    <StyledConfirmDelete>
      <Heading as="h3">Delete {resourceName}</Heading>
      <p>
        Are you sure you want to delete this {resourceName} permanently? This action cannot be
        undone.
      </p>

      <div>
        <Button
          onClick={() => {
            onCloseModal?.();
          }}
          {...buttonDefaultProps}
          variation="secondary"
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          {...buttonDefaultProps}
          variation="danger"
          disabled={disabled}
          onClick={() => {
            onConfirm();
            onCloseModal?.();
          }}
        >
          Delete
        </Button>
      </div>
    </StyledConfirmDelete>
  );
};
