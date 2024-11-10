import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CarbonTableUIElementComponentConfigs,
  CarbonTableUIElementComponentEvents,
} from '@dj-ui/carbon-components/carbon-table';
import {
  DjuiComponent,
  LayoutTemplateService,
  RemoteResourceTemplateService,
  UIElementTemplateService,
} from '@dj-ui/core';

@Component({
  selector: 'namnguyen191-builder-patterns',
  standalone: true,
  imports: [DjuiComponent],
  templateUrl: './builder-patterns.component.html',
  styleUrl: './builder-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderPatternsComponent {
  readonly PREVIEW_LAYOUT_ID = 'preview-layout';
  readonly #layoutTemplateService = inject(LayoutTemplateService);
  readonly #uiElementTemplateService = inject(UIElementTemplateService);
  readonly #remoteResourceTemplateService = inject(RemoteResourceTemplateService);

  constructor() {
    this.#remoteResourceTemplateService.registerRemoteResourceTemplate({
      id: 'pokemon-server-pagination',
      stateSubscription: {
        watchedScopes: {
          global: ['pokemonPage'],
        },
        variables: {
          currentPage: '<${ return this.state?.global?.pokemonPage?.selectedPage ?? 0 }$>',
          currentItemPerPage: '<${ return this.state?.global?.pokemonPage?.pageLength ?? 10 }$>',
        },
      },
      options: {
        requests: [
          {
            fetcherId: 'httpFetcher',
            configs: {
              endpoint:
                '<${ return `https://pokeapi.co/api/v2/pokemon?offset=${(this.state.variables.currentPage) * (this.state.variables.currentItemPerPage)}&limit=${this.state.variables.currentItemPerPage}` }$>',
              method: 'GET',
            },
            interpolation:
              '<${ return { pokemons: this.$current.results, totalCount: this.$current.count } }$>',
          },
        ],
      },
    });

    this.#uiElementTemplateService.registerUIElementTemplate<
      CarbonTableUIElementComponentConfigs,
      keyof CarbonTableUIElementComponentEvents
    >({
      id: 'test1',
      type: 'CARBON_TABLE',
      remoteResourceIds: ['pokemon-server-pagination'],
      options: {
        title: 'Server side pagination table',
        headers: ['Name', 'Url'],
        rows: '<${ return this.remoteResourcesStates?.results?.["pokemon-server-pagination"]?.result?.pokemons?.map(({name, url}) => ([name, url])) ?? [] }$>' as any,
        pagination: {
          totalDataLength:
            "<${ return this.remoteResourcesStates?.results?.['pokemon-server-pagination']?.result?.totalCount ?? 0 }$>" as any,
          pageSizes: [10, 15, 25, 50],
          pageInputDisabled: false,
        },
      },
      eventsHooks: {
        paginationChanged: [
          {
            type: 'addToState',
            payload: {
              scope: 'global',
              data: {
                pokemonPage: '<${ return this.$paginationContext }$>',
              },
            },
          },
          {
            type: 'showTestNotification',
          },
        ],
      },
    });
    this.#layoutTemplateService.registerLayoutTemplate({
      id: this.PREVIEW_LAYOUT_ID,
      uiElementInstances: [
        {
          id: 'instance-1',
          uiElementTemplateId: 'test1',
        },
      ],
    });
  }
}
