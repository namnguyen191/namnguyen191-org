# DJ-UI

## Quick setup instruction

This guide will show you all the steps to get a simple version of DJ-UI up and running with dj-ui-carbon-component. In this example, our setup is a simple Angular app managed using [NX](https://nx.dev/)

### 1. Installation

- Install `core` and `common` lib:

```sh
npm install @namnguyen191/dj-ui-core @namnguyen191/dj-ui-common
```

- Install the integrated component lib [@namnguyen191/dj-ui-carbon-components](https://www.npmjs.com/package/@namnguyen191/dj-ui-carbon-components) and follow their setup instruction.

```sh
npm install @namnguyen191/dj-ui-carbon-components
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

import { handleRunJsMessage } from '@namnguyen191/dj-ui-core/js-interpolation-worker';

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
import { JS_RUNNER_WORKER } from '@namnguyen191/dj-ui-core';

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

DJ-UI relies on templates written in JSON to display the UI. In this example we will be creating these templates at static assets in our app and create a simple service that fetch them. These templates is to configure a simple layout with a single table that can fetch data with server side pagination.

- Create static file for the ui element template `public/dj-ui-assets/layout-templates/carbon_example_layout_template.json`:

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

- Create static file for the remote resource template `public/dj-ui-assets/remote-resource-templates/carbon_example_remote_resource_template.json`:

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

- Create static file for the layout template `public/dj-ui-assets/ui-element-templates/carbon_example_ui_element_template.json`:

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

- Create a simple service to fetch these templates `src/app/dj-ui-templates.service.ts`:

```js
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LayoutTemplate,
  RemoteResourceTemplate,
  UIElementTemplate,
} from '@namnguyen191/dj-ui-core';

@Injectable({
  providedIn: 'root',
})
export class DJ-UITemplatesService {
  readonly #httpClient = inject(HttpClient);

  // Either use arrow function or manually bind the function to "this" in the constructor as these functions
  // will be pass down and run in a different context.
  getLayoutTemplate = (id: string) =>
    this.#httpClient.get<LayoutTemplate>(
      `/dj-ui-assets/layout-templates/${id}.json`
    );

  getUiElementTemplate = (id: string) =>
    this.#httpClient.get<UIElementTemplate>(
      `/dj-ui-assets/ui-element-templates/${id}.json`
    );

  getRemoteResourceTemplate = (id: string) =>
    this.#httpClient.get<RemoteResourceTemplate>(
      `/dj-ui-assets/remote-resource-templates/${id}.json`
    );
}
```

### 4. Provide DJ-UI global configs:

- Provide value for the injection token `DJ-UI_COMMON_SETUP_CONFIG`:

```js
import {
  ApplicationConfig,
  inject,
} from '@angular/core';
import { DJ-UI_COMMON_SETUP_CONFIG, DJ-UISetupConfigs } from '@namnguyen191/dj-ui-common';
import {
  CarbonButtonComponent,
  CarbonTableComponent,
} from '@namnguyen191/dj-ui-carbon-components';
import { DJ-UITemplatesService } from './dj-ui-templates.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: DJ-UI_COMMON_SETUP_CONFIG,
      useFactory: (): DJ-UISetupConfigs => {
        const dj-uiTemplatesSerivce = inject(DJ-UITemplatesService);

        return {
          templatesHandlers: {
            getLayoutTemplate: dj-uiTemplatesSerivce.getLayoutTemplate,
            getUiElementTemplate: dj-uiTemplatesSerivce.getUiElementTemplate,
            getRemoteResourceTemplate:
              dj-uiTemplatesSerivce.getRemoteResourceTemplate,
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

- Use utility function from `common` to initialize DJ-UI. This will need to be run inside a component (ideally a top level-one) since it create a bunch of subscription that automatically unsubscribed based on the component's life cycle. For example, in `src/app/app.component.ts`:

```js
import { Component } from '@angular/core';
import { setupDefaultDJ-UI } from '@namnguyen191/dj-ui-common';
import { DJUIComponent } from '@namnguyen191/dj-ui-core';

@Component({
  standalone: true,
  imports: [DJUIComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor() {
    setupDefaultDJ-UI();
  }
}
```

- And now we can display the layout in `src/app/app.component.html`:

```html
<namnguyen191-dj-ui layoutId="carbon_example_layout_template"></namnguyen191-dj-ui>
```
