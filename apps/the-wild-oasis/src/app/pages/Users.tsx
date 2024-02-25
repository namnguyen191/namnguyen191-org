// import { FC } from 'react';

// import Heading from '../ui/Heading';

// export const NewUsers: FC = () => {
//   return <Heading as="h1">Create a new user</Heading>;
// };

import { FC } from 'react';

import { SignupForm } from '../features/authentication/SignupForm';
import { Heading } from '../ui/Heading';

export const Users: FC = () => {
  return (
    <>
      <Heading as="h1">Create a new user</Heading>

      <SignupForm />
    </>
  );
};
