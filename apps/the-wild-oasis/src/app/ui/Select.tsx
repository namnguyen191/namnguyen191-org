import { ReactElement } from 'react';
import styled from 'styled-components';

export type SelectTheme = { type: 'white' | 'black' };

export const StyledSelect = styled.select<SelectTheme>`
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

export type SelectOption = {
  value: string;
  label: string;
};
export type SelectProps = Partial<SelectTheme> & {
  options: SelectOption[];
  value?: string;
  defaultLabel?: string;
  onChange: (value: string) => void;
};

export const Select = (props: SelectProps): ReactElement => {
  const {
    options,
    value,
    type = 'white',
    defaultLabel = 'Please select a value',
    onChange,
  } = props;

  return (
    <StyledSelect onChange={(e) => onChange?.(e.target.value)} value={value} type={type}>
      <option>{defaultLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
};
