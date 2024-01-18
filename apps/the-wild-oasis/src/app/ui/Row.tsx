import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

export type RowsProps = {
  type?: 'horizontal' | 'vertical';
};
export const Row = styled.div<RowsProps>`
  display: flex;
  ${(props): FlattenSimpleInterpolation =>
    props.type !== 'horizontal'
      ? css`
          justify-content: space-between;
          align-items: center;
        `
      : css`
          flex-direction: column;
          gap: 1.6rem;
        `}
`;
