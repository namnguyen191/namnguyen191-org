import {
  CarbonButtonElementType,
  CarbonCarouselCardElementType,
  CarbonCarouselElementType,
  CarbonTableElementType,
  CarbonTextCardElementType,
} from '@namnguyen191/dui-carbon-components/shared';
import { ComponentLoadersMap } from '@namnguyen191/dui-common';

export const DuiCarbonComponentLoader: ComponentLoadersMap = {
  [CarbonButtonElementType]: () =>
    import('@namnguyen191/dui-carbon-components/carbon-button').then(
      (m) => m.CarbonButtonComponent
    ),
  [CarbonTableElementType]: () =>
    import('@namnguyen191/dui-carbon-components/carbon-table').then((m) => m.CarbonTableComponent),
  [CarbonTextCardElementType]: () =>
    import('@namnguyen191/dui-carbon-components/carbon-text-card').then(
      (m) => m.CarbonTextCardComponent
    ),
  [CarbonCarouselElementType]: () =>
    import('@namnguyen191/dui-carbon-components/carbon-carousel').then(
      (m) => m.CarbonCarouselComponent
    ),
  [CarbonCarouselCardElementType]: () =>
    import('@namnguyen191/dui-carbon-components/carbon-carousel-card').then(
      (m) => m.CarbonCarouselCardComponent
    ),
};
