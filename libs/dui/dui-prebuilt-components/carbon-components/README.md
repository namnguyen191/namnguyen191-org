# carbon-components

## Intergration with DUI:

- Add these global styles to your Angular app as per [Carbon Components Angular guideline](https://angular.carbondesignsystem.com/documentation/index.html):

```scss
@use '@carbon/styles';
```

- Register a use these components are per DUI guideline:

```ts
import { CarbonButtonComponent, CarbonTableComponent } from '@namnguyen191/carbon-components';

this.#uiElementFactoryService.registerUIElement({
  type: CarbonTableComponent.ELEMENT_TYPE,
  component: CarbonTableComponent,
});

this.#uiElementFactoryService.registerUIElement({
  type: CarbonButtonComponent.ELEMENT_TYPE,
  component: CarbonButtonComponent,
});
```
