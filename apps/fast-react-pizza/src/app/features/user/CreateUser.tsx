import { FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../storeHooks';
import { Button } from '../../ui/Button';
import { updateName } from './userSlice';

export const CreateUser: FC = () => {
  const [username, setUsername] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!username) {
      return;
    }

    dispatch(updateName(username));
    navigate('/menu');
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm text-stone-600 md:text-base">
        <span role="img" aria-hidden>
          👋
        </span>{' '}
        Welcome! Please start by telling us your name:
      </p>

      <input
        data-cy="username-input"
        type="text"
        placeholder="Your full name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input mb-8 w-72"
      />

      {username !== '' && (
        <div>
          <Button data-cy="start-order-button">Start ordering</Button>
        </div>
      )}
    </form>
  );
};
