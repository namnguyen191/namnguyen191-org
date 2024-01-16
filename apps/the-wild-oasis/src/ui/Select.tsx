import styled from 'styled-components';

export const StyledSelect = styled.select<{ type: 'white' | 'black' }>`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props): 'var(--color-grey-100)' | 'var(--color-grey-300)' =>
      props.type === 'white' ? 'var(--color-grey-100)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
`;
