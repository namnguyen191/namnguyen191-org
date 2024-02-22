import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

export type HeadingProps = {
  as: 'h1' | 'h2' | 'h3' | 'h4';
};
export const Heading = styled.h1<HeadingProps>`
  ${(props): false | FlattenSimpleInterpolation =>
    props.as === 'h1' &&
    css`
      font-size: 3rem;
      font-weight: 600;
    `}

  ${(props): false | FlattenSimpleInterpolation =>
    props.as === 'h2' &&
    css`
      font-size: 2rem;
      font-weight: 600;
    `}

  ${(props): false | FlattenSimpleInterpolation =>
    props.as === 'h3' &&
    css`
      font-size: 2rem;
      font-weight: 500;
    `}

  ${(props): false | FlattenSimpleInterpolation =>
    props.as === 'h4' &&
    css`
      font-size: 3rem;
      font-weight: 600;
      text-align: center;
    `}

  line-height: 1.4;
`;
