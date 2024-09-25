# dj-ui-carbon-components

## Intergration with DJ-UI:

- Add these global styles to your Angular app as per [Carbon Components Angular guideline](https://angular.carbondesignsystem.com/documentation/index.html):

```scss
@use '@carbon/styles';
```

- Register a use these components are per DJ-UI guideline:

```ts
import { CarbonButtonComponent, CarbonTableComponent } from '@dj-ui/carbon-components';

this.#uiElementFactoryService.registerUIElement({
  type: CarbonTableComponent.ELEMENT_TYPE,
  component: CarbonTableComponent,
});

this.#uiElementFactoryService.registerUIElement({
  type: CarbonButtonComponent.ELEMENT_TYPE,
  component: CarbonButtonComponent,
});
```
