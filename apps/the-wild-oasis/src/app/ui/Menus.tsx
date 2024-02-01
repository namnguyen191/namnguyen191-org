import {
  createContext,
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactEventHandler,
  useContext,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { HiEllipsisVertical } from 'react-icons/hi2';
import styled from 'styled-components';

import { useOutsideClick } from '../hooks/useOutsideClick';

export type MenuPosition = {
  x: number;
  y: number;
};

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledToggle = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transform: translateX(0.8rem);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-700);
  }
`;

const StyledList = styled.ul<{ position: MenuPosition }>`
  position: fixed;

  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-md);

  right: ${(props): number => props.position.x}px;
  top: ${(props): number => props.position.y}px;
`;

const StyledButton = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 1.2rem 2.4rem;
  font-size: 1.4rem;
  transition: all 0.2s;

  display: flex;
  align-items: center;
  gap: 1.6rem;

  &:hover {
    background-color: var(--color-grey-50);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }
`;

export type MenuContextValues = {
  openId: string;
  close: () => void;
  open: (id: string) => void;
  position: MenuPosition;
  setPosition: (position: MenuPosition) => void;
};
const MenusContext = createContext<MenuContextValues>({
  openId: '',
  close: () => console.error('Please provide the close method for MenuContext'),
  open: () => console.error('Please provide the close method for MenuContext'),
  setPosition: () => console.error('Please provide the close method for MenuContext'),
  position: { x: 0, y: 0 },
});

const Toggle: FC<{ id: string }> = ({ id }) => {
  const { openId, close, open, setPosition } = useContext(MenusContext);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const target = e.target as HTMLButtonElement;
    const rect = target.closest('button')?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPosition({
      x: window.innerWidth - rect.width - rect.x,
      y: rect.y + rect.height + 8,
    });

    if (openId === '' || openId !== id) {
      open(id);
    } else {
      close();
    }
  };

  return (
    <StyledToggle onClick={handleClick}>
      <HiEllipsisVertical />
    </StyledToggle>
  );
};

const List: FC<PropsWithChildren<{ id: string }>> = ({ id, children }) => {
  const { openId, position, close } = useContext(MenusContext);

  const ref = useOutsideClick<HTMLUListElement>(close);

  if (openId !== id) return null;

  return createPortal(
    <StyledList position={position} ref={ref}>
      {children}
    </StyledList>,
    document.body
  );
};

const Button: FC<
  PropsWithChildren<{ icon: ReactElement; onClick?: () => void; disabled?: boolean }>
> = ({ children, icon, onClick, disabled }) => {
  const { close } = useContext(MenusContext);

  const handleClick: ReactEventHandler<HTMLButtonElement> = () => {
    onClick?.();
    close();
  };

  return (
    <li>
      <StyledButton onClick={handleClick} disabled={disabled}>
        {icon}
        <span>{children}</span>
      </StyledButton>
    </li>
  );
};

const Menus: FC<PropsWithChildren> & {
  Menu: typeof Menu;
  Toggle: typeof Toggle;
  List: typeof List;
  Button: typeof Button;
} = ({ children }) => {
  const [openId, setOpenId] = useState<string>('');
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  const close = (): void => {
    setOpenId('');
  };
  const open = setOpenId;

  return (
    <MenusContext.Provider value={{ openId, close, open, position, setPosition }}>
      {children}
    </MenusContext.Provider>
  );
};

Menus.Menu = Menu;
Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = Button;

export { Menus };
