# dui

## Quick setup instruction

This guide will show you all the steps to get a simple version of DUI up and running with dui-carbon-component. In this example, our setup is a simple Angular app managed using [NX](https://nx.dev/)

### 1. Installation

- Install `core` and `common` lib:

```sh
npm install @namnguyen191/dui-core @namnguyen191/dui-common
```

- Install the integrated component lib [@namnguyen191/dui-carbon-components](https://www.npmjs.com/package/@namnguyen191/dui-carbon-components) and follow their setup instruction.

```sh
npm install @namnguyen191/dui-carbon-components
```

### 2. JS runner setup:

The way a web worker can be setup can be different between each projects. So follow your framework guidance for setup. The key idea is to provide the injection token `JS_RUNNER_WORKER` with an instance of a web worker.

- Add a `tsconfig.worker.json` file at the root of your project:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "out-tsc/worker",
    "lib": ["ESNext", "webworker"],
    "types": []
  },
  "include": ["src/**/*.worker.ts"]
}
```

- Adjust your `project.json` to use it:

```json
{
  "targets": {
    "options": {
      "webWorkerTsConfig": "tsconfig.worker.json"
    }
  }
}
```

- Create the web worker file `src/app/js-runner.worker.ts`:

```js
/// <reference lib="webworker" />

import { handleRunJsMessage } from '@namnguyen191/dui-core';

addEventListener('message', (e) => {
  const allowList = new Set() < string > ['console', 'JSON', 'Math'];
  handleRunJsMessage(e, allowList);
});
```

- Provide the `JS_RUNNER_WORKER` token for your app. This is usually in `app.config.ts`:

```js
import {
  ApplicationConfig,
} from '@angular/core';
import { JS_RUNNER_WORKER } from '@namnguyen191/dui-core';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: JS_RUNNER_WORKER,
      useFactory: (): Worker => {
        const worker = new Worker(
          new URL('./js-runner.worker', import.meta.url),
          {
            name: 'CustomWorker',
            type: 'module',
          }
        );
        return worker;
      }
    }
  ]
};
```

### 3. Templates and fetchers:

DUI relies on templates written in JSON to display the UI. In this example we will be creating these templates at static assets in our app and create a simple service that fetch them. These templates is to configure a simple layout with a single table that can fetch data with server side pagination.

- Create static file for the ui element template `public/dui-assets/layout-templates/carbon_example_layout_template.json`:

```json
{
  "id": "carbon_example_layout_template",
  "uiElementInstances": [
    {
      "id": "instance-1",
      "uiElementTemplateId": "carbon_table_server_side_pagination",
      "positionAndSize": {
        "x": 9,
        "y": 20,
        "rows": 20,
        "cols": 8,
        "resizeEnabled": false,
        "dragEnabled": false
      }
    }
  ]
}
```

- Create static file for the remote resource template `public/dui-assets/remote-resource-templates/carbon_example_remote_resource_template.json`:

```json
{
  "id": "carbon_example_remote_resource_template",
  "stateSubscription": {
    "global": ["pokemonPage"]
  },
  "options": {
    "requests": [
      {
        "fetcherId": "httpFetcher",
        "configs": {
          "endpoint": "<${ return `https://pokeapi.co/api/v2/pokemon?offset=${(this.state?.global?.pokemonPage?.selectedPage ?? 0) * (this.state?.global?.pokemonPage?.pageLength ?? 10)}&limit=${this.state?.global?.pokemonPage?.pageLength ?? 10}` }$>",
          "method": "GET"
        },
        "interpolation": "<${ return { pokemons: this.$current.results, totalCount: this.$current.count } }$>"
      }
    ]
  }
}
```

- Create static file for the layout template `public/dui-assets/ui-element-templates/carbon_example_ui_element_template.json`:

```json
{
  "id": "carbon_example_ui_element_template",
  "type": "CARBON_TABLE",
  "remoteResourceIds": ["carbon_example_remote_resource_template"],
  "options": {
    "title": "Server side pagination table",
    "headers": ["Name", "Url"],
    "rows": "<${ return this.remoteResourcesStates?.results?.[\"carbon_example_remote_resource_template\"]?.result?.pokemons?.map(({name, url}) => ([name, url])) ?? [] }$>",
    "pagination": {
      "totalDataLength": "<${ return this.remoteResourcesStates?.results?.['carbon_example_remote_resource_template']?.result?.totalCount ?? 0 }$>",
      "pageSizes": [10, 15, 25, 50],
      "pageInputDisabled": false
    }
  },
  "eventsHooks": {
    "paginationChanged": [
      {
        "type": "addToState",
        "payload": {
          "scope": "global",
          "data": {
            "pokemonPage": "<${ return this.$paginationContext }$>"
          }
        }
      }
    ]
  }
}
```

- Create a simple service to fetch these templates `src/app/dui-templates.service.ts`:

```js
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LayoutTemplate,
  RemoteResourceTemplate,
  UIElementTemplate,
} from '@namnguyen191/dui-core';

@Injectable({
  providedIn: 'root',
})
export class DUITemplatesService {
  readonly #httpClient = inject(HttpClient);

  // Either use arrow function or manually bind the function to "this" in the constructor as these functions
  // will be pass down and run in a different context.
  getLayoutTemplate = (id: string) =>
    this.#httpClient.get<LayoutTemplate>(
      `/dui-assets/layout-templates/${id}.json`
    );

  getUiElementTemplate = (id: string) =>
    this.#httpClient.get<UIElementTemplate>(
      `/dui-assets/ui-element-templates/${id}.json`
    );

  getRemoteResourceTemplate = (id: string) =>
    this.#httpClient.get<RemoteResourceTemplate>(
      `/dui-assets/remote-resource-templates/${id}.json`
    );
}
```

### 4. Provide DUI global configs:

- Provide value for the injection token `DUI_COMMON_SETUP_CONFIG`:

```js
import {
  ApplicationConfig,
  inject,
} from '@angular/core';
import { DUI_COMMON_SETUP_CONFIG, DUISetupConfigs } from '@namnguyen191/dui-common';
import {
  CarbonButtonComponent,
  CarbonTableComponent,
} from '@namnguyen191/dui-carbon-components';
import { DUITemplatesService } from './dui-templates.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: DUI_COMMON_SETUP_CONFIG,
      useFactory: (): DUISetupConfigs => {
        const duiTemplatesSerivce = inject(DUITemplatesService);

        return {
          templatesHandlers: {
            getLayoutTemplate: duiTemplatesSerivce.getLayoutTemplate,
            getUiElementTemplate: duiTemplatesSerivce.getUiElementTemplate,
            getRemoteResourceTemplate:
              duiTemplatesSerivce.getRemoteResourceTemplate,
          },
          componentsMap: {
            [CarbonButtonComponent.ELEMENT_TYPE]: CarbonButtonComponent,
            [CarbonTableComponent.ELEMENT_TYPE]: CarbonTableComponent,
          },
        };
      },
    },
  ],
};
```

- Use utility function from `common` to initialize DUI. This will need to be run inside a component (ideally a top level-one) since it create a bunch of subscription that automatically unsubscribed based on the component's life cycle. For example, in `src/app/app.component.ts`:

```js
import { Component } from '@angular/core';
import { setupDefaultDUI } from '@namnguyen191/dui-common';
import { DuiComponent } from '@namnguyen191/dui-core';

@Component({
  standalone: true,
  imports: [DuiComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor() {
    setupDefaultDUI();
  }
}
```

- And now we can display the layout in `src/app/app.component.html`:

```html
<namnguyen191-dui layoutId="carbon_example_layout_template"></namnguyen191-dui>
```
