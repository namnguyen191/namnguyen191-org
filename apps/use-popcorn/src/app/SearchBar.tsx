import { FC, useRef } from 'react';

import { useKeyWatch } from './useKeyWatch';

export type SearchBarProps = {
  onSearch?: (searchValue: string) => void;
};
export const SearchBar: FC<SearchBarProps> = ({ onSearch = (): void => {} }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useKeyWatch('enter', () => {
    inputRef.current?.focus();
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      onChange={(e) => onSearch(e.target.value)}
      ref={inputRef}
    />
  );
};
