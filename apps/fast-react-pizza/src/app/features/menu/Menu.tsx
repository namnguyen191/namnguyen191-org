import { FC } from 'react';
import { useLoaderData } from 'react-router-dom';

import { getMenu, MenuItem as MenuItemType } from '../../services/apiRestaurant';
import { MenuItem } from './MenuItem';

export const loader = async (): Promise<MenuItemType[]> => {
  const menu = await getMenu();
  return menu;
};

export const Menu: FC = () => {
  const menu: MenuItemType[] = useLoaderData() as MenuItemType[];
  console.log('Nam data is: ', menu);
  return (
    <ul>
      {menu.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
};
