import {
  CarbonButtonElementType,
  CarbonCarouselCardElementType,
  CarbonCarouselElementType,
  CarbonTableElementType,
  CarbonTextCardElementType,
} from '@dj-ui/carbon-components/shared';
import { ComponentLoadersMap } from '@dj-ui/common';

export const CarbonComponentLoader: ComponentLoadersMap = {
  [CarbonButtonElementType]: () =>
    import('@dj-ui/carbon-components/carbon-button').then((m) => m.CarbonButtonComponent),
  [CarbonTableElementType]: () =>
    import('@dj-ui/carbon-components/carbon-table').then((m) => m.CarbonTableComponent),
  [CarbonTextCardElementType]: () =>
    import('@dj-ui/carbon-components/carbon-text-card').then((m) => m.CarbonTextCardComponent),
  [CarbonCarouselElementType]: () =>
    import('@dj-ui/carbon-components/carbon-carousel').then((m) => m.CarbonCarouselComponent),
  [CarbonCarouselCardElementType]: () =>
    import('@dj-ui/carbon-components/carbon-carousel-card').then(
      (m) => m.CarbonCarouselCardComponent
    ),
};
