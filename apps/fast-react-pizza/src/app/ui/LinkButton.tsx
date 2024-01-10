import { FC, PropsWithChildren } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';

export type LinkButtonProps = LinkProps;

export const LinkButton: FC<PropsWithChildren<LinkButtonProps>> = ({ children, ...linkProps }) => {
  const navigate = useNavigate();

  const className = 'text-sm text-blue-500 hover:text-blue-600 hover:underline';

  if (linkProps.to === '-1') {
    return (
      <button className={className} onClick={() => navigate(-1)}>
        {children}
      </button>
    );
  }

  return (
    <Link className={className} {...linkProps}>
      {children}
    </Link>
  );
};
