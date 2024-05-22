# mui-components

## Intergration with DUI:

- Add these global styles to your Angular app as per Material UI guideline:

```scss
/* You can add global styles to this file, and also import other style files */
@import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family: Roboto, 'Helvetica Neue', sans-serif;
}
```

- Enable Animation Async on your Angular app, for example in your `app.config.ts`:

```ts
 export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    ...
  ]
};
```

- Include an MUI prebuilt theme to your app built assets, for example:

```json
{
  "styles": [
          "./src/styles.scss",
          "@angular/material/prebuilt-themes/indigo-pink.css"
        ],
  ...
}
```

- Register a use these components are per DUI guideline:

```ts
import { SimpleTableComponent } from '@namnguyen191/dui/prebuilt-components';

this.uiElementFactoryService.registerUIElement({
  type: SimpleTableComponent.ELEMENT_TYPE,
  component: SimpleTableComponent,
});
```
