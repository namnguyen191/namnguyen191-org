import { ComponentLoadersMap } from '@namnguyen191/dui-common';

export const DuiMuiComponentLoader: ComponentLoadersMap = {
  SIMPLE_BUTTON: () =>
    import('@namnguyen191/dui-mui-components/simple-button').then((m) => m.SimpleButtonComponent),
  SIMPLE_TABLE: () =>
    import('@namnguyen191/dui-mui-components/simple-table').then((m) => m.SimpleTableComponent),
  TABS: () => import('@namnguyen191/dui-mui-components/tabs').then((m) => m.TabsComponent),
};
