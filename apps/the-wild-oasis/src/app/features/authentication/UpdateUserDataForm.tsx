import { FC, FormEvent, MouseEventHandler, useState } from 'react';
import { Form } from 'react-router-dom';

import { Button, buttonDefaultProps } from '../../ui/Button';
import { FileInput } from '../../ui/FileInput';
import { FormRow } from '../../ui/FormRow';
import { Input } from '../../ui/Input';
import { useCurrentUser, useUpdateCurrentUser } from './authQueryHooks';

export const UpdateUserDataForm: FC = () => {
  // We don't need the loading state, and can immediately use the user data, because we know that it has already been loaded at this point
  const { user } = useCurrentUser();
  const { updateCurrentUser, isUpdatingUser } = useUpdateCurrentUser();
  const [fullName, setFullName] = useState<string>(user?.user_metadata?.fullName ?? '');
  const [avatar, setAvatar] = useState<File | undefined>(undefined);

  if (!user) {
    return;
  }

  const {
    email,
    user_metadata: { fullName: currentFullName },
  } = user;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    updateCurrentUser(
      {
        fullName,
        avatar,
      },
      {
        onSuccess: () => {
          setAvatar(undefined);
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = () => {
    setFullName(currentFullName);
    setAvatar(undefined);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email address">
        <Input value={email} disabled />
      </FormRow>
      <FormRow label="Full name">
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          id="fullName"
          disabled={isUpdatingUser}
        />
      </FormRow>
      <FormRow label="Avatar image">
        <FileInput
          disabled={isUpdatingUser}
          id="avatar"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0])}
        />
      </FormRow>
      <FormRow>
        <Button
          {...buttonDefaultProps}
          disabled={isUpdatingUser}
          onClick={handleCancel}
          type="reset"
          variation="secondary"
        >
          Cancel
        </Button>
        <Button {...buttonDefaultProps} disabled={isUpdatingUser}>
          Update account
        </Button>
      </FormRow>
    </Form>
  );
};
