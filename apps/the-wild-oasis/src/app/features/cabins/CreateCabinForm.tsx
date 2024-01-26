import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { Cabin } from '../../services/apiCabins';
import { Button, buttonDefaultProps } from '../../ui/Button';
import { FileInput } from '../../ui/FileInput';
import { Form } from '../../ui/Form';
import { FormRow } from '../../ui/FormRow';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useCreateCabin, useEditCabin } from './cabinQueryHooks';

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  padding: 1.2rem 0;
`;

type FormInputs = {
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  description: string;
  imageFile: FileList;
};

export type CreateCabinFormProps = {
  cabin?: Cabin;
  onCloseModal?: () => void;
};
export const CreateCabinForm: FC<CreateCabinFormProps> = ({ cabin, onCloseModal }) => {
  const isEditMode = cabin !== undefined;
  const { register, handleSubmit, reset, getValues, formState } = useForm<FormInputs>({
    defaultValues: {
      ...(cabin ?? {}),
    },
  });
  const { createCabin, isCreatingCabin } = useCreateCabin();
  const { updateCabin, isUpdatingCabin } = useEditCabin();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const { name, maxCapacity, regularPrice, discount, description, imageFile } = data;
    const upsertData = {
      name,
      description,
      maxCapacity: Number(maxCapacity),
      regularPrice: Number(regularPrice),
      discount: Number(discount),
    };
    if (isEditMode && cabin) {
      updateCabin(
        { ...cabin, ...upsertData, imageFile: imageFile?.[0] },
        {
          onSuccess: () => {
            onCloseModal?.();
          },
        }
      );
    } else {
      createCabin(
        { ...upsertData, imageFile: imageFile[0]! },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    }
  };

  return (
    <Form type={onCloseModal ? 'modal' : 'regular'} onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="name" error={formState.errors.name?.message}>
        <Input
          type="text"
          id="name"
          disabled={isCreatingCabin || isUpdatingCabin}
          {...register('name', { required: 'This field is required' })}
        />
      </FormRow>

      <FormRow label="Maximum capacity" error={formState.errors.maxCapacity?.message}>
        <Input
          type="number"
          id="maxCapacity"
          disabled={isCreatingCabin || isUpdatingCabin}
          {...register('maxCapacity', {
            required: 'This field is required',
            min: {
              value: 1,
              message: 'Max capacity should be at least 1',
            },
          })}
        />
      </FormRow>

      <FormRow label="Regular price" error={formState.errors.regularPrice?.message}>
        <Input
          type="number"
          id="regularPrice"
          disabled={isCreatingCabin || isUpdatingCabin}
          {...register('regularPrice', {
            required: 'This field is required',
            min: {
              value: 1,
              message: 'Price should be at least 1',
            },
          })}
        />
      </FormRow>

      <FormRow label="Discount" error={formState.errors.discount?.message}>
        <Input
          type="number"
          id="discount"
          defaultValue={0}
          disabled={isCreatingCabin || isUpdatingCabin}
          {...register('discount', {
            required: 'This field is required',
            validate: (value) =>
              value <= getValues().regularPrice ||
              'Discount should not be greater than regular price',
          })}
        />
      </FormRow>

      <FormRow label="Description for website" error={formState.errors.description?.message}>
        <Textarea
          id="description"
          defaultValue=""
          disabled={isCreatingCabin || isUpdatingCabin}
          {...register('description', { required: 'This field is required' })}
        />
      </FormRow>

      <FormRow label="Cabin photo" error={formState.errors.imageFile?.message}>
        <FileInput
          id="image"
          accept="image/*"
          disabled={isCreatingCabin || isUpdatingCabin}
          {...register('imageFile', {
            required: !isEditMode ? 'This field is required' : undefined,
          })}
        />
      </FormRow>

      <ButtonRow>
        <Button
          {...buttonDefaultProps}
          variation="secondary"
          type="reset"
          disabled={isCreatingCabin || isUpdatingCabin}
          onClick={onCloseModal}
        >
          Cancel
        </Button>
        <Button {...buttonDefaultProps} disabled={isCreatingCabin || isUpdatingCabin}>
          {isEditMode ? 'Edit cabin' : 'Create new cabin'}
        </Button>
      </ButtonRow>
    </Form>
  );
};
