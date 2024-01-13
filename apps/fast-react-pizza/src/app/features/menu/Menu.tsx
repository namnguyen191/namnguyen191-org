import { FC } from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';

import { getMenu, MenuItem as MenuItemType } from '../../services/apiRestaurant';
import { MenuItem } from './MenuItem';

export const loader: LoaderFunction = async (): Promise<MenuItemType[]> => {
  const menu = await getMenu();
  return menu;
};

export const Menu: FC = () => {
  const menu: MenuItemType[] = useLoaderData() as MenuItemType[];
  return (
    <ul className="divide-y divide-stone-200 px-2">
      {menu.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
};
