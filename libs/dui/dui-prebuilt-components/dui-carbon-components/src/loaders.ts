import { ComponentLoadersMap } from '@namnguyen191/dui-common';

export const DuiCarbonComponentLoader: ComponentLoadersMap = {
  CARBON_BUTTON: () =>
    import('@namnguyen191/dui-carbon-components/carbon-button').then(
      (m) => m.CarbonButtonComponent
    ),
  CARBON_TABLE: () =>
    import('@namnguyen191/dui-carbon-components/carbon-table').then((m) => m.CarbonTableComponent),
  CARBON_TEXT_CARD: () =>
    import('@namnguyen191/dui-carbon-components/carbon-text-card').then(
      (m) => m.CarbonTextCardComponent
    ),
};
