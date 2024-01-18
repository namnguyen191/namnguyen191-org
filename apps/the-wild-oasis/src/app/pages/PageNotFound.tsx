// import { FC } from 'react';
// import styled from 'styled-components';

// import { useMoveBack } from '../hooks/useMoveBack';
// import Heading from '../ui/Heading';

// const StyledPageNotFound = styled.main`
//   height: 100vh;
//   background-color: var(--color-grey-50);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 4.8rem;
// `;

// const Box = styled.div`
//   /* box */
//   background-color: var(--color-grey-0);
//   border: 1px solid var(--color-grey-100);
//   border-radius: var(--border-radius-md);

//   padding: 4.8rem;
//   flex: 0 1 96rem;
//   text-align: center;

//   & h1 {
//     margin-bottom: 3.2rem;
//   }
// `;

// export const PageNotFound: FC = () => {
//   const moveBack = useMoveBack();

//   return (
//     <StyledPageNotFound>
//       <Box>
//         <Heading as="h1">
//           The page you are looking for could not be found{' '}
//           <span role="img" aria-hidden>
//             😢
//           </span>
//         </Heading>
//         <button onClick={moveBack}>&larr; Go back</button>
//       </Box>
//     </StyledPageNotFound>
//   );
// };

import { FC } from 'react';

export const PageNotFound: FC = () => {
  return <div>PageNotFound work!</div>;
};
