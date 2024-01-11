import { ButtonHTMLAttributes, DetailedHTMLProps, FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  to?: string;
  btnType?: 'primary' | 'small' | 'secondary';
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  to,
  btnType = 'primary',
  ...buttonProps
}) => {
  const baseStyle =
    'inline-block text-sm rounded-full bg-yellow-400 font-semibold uppercase tracking-wide text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2 disabled:cursor-not-allowed';
  const styles: {
    [K in ButtonProps['btnType'] as K extends string ? K : never]: string;
  } = {
    primary: baseStyle + ' px-4 py-3 md:px-6 md:py-4',
    small: baseStyle + ' px-4 py-2 md:px-5 md:py-2.5 text-xs',
    secondary:
      'inline-block text-sm rounded-full border-2 border-stone-300 font-semibold uppercase tracking-wide text-stone-400 transition-colors duration-300 hover:bg-stone-300 hover:text-stone-800 focus:bg-stone-300 focus:text-stone-800 focus:outline-none focus:ring focus:ring-stone-200 focus:ring-offset-2 disabled:cursor-not-allowed px-4 py-2.5 md:px-6 md:py-3.5',
  };

  if (to) {
    return (
      <Link className={styles[btnType]} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles[btnType]} {...buttonProps}>
      {children}
    </button>
  );
};