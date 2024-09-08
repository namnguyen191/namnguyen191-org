import { ComponentLoadersMap } from '@namnguyen191/dui-common';

export const DuiMuiComponentLoader: ComponentLoadersMap = {
  CARBON_BUTTON: () =>
    import('@namnguyen191/dui-mui-components/simple-button').then((m) => m.SimpleButtonComponent),
  CARBON_TABLE: () =>
    import('@namnguyen191/dui-mui-components/simple-table').then((m) => m.SimpleTableComponent),
  CARBON_TEXT_CARD: () =>
    import('@namnguyen191/dui-mui-components/tabs').then((m) => m.TabsComponent),
};
