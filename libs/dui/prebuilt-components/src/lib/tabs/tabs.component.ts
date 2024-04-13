import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignalWithTransform } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import {
  inputObsTransform,
  LayoutComponent,
  UIElementImplementation,
  ZodIsError,
  ZodIsLoading,
} from '@namnguyen191/dui';
import { Observable, of } from 'rxjs';
import { z } from 'zod';

const ZodTabConfigObject = z.object({
  layoutId: z.string({
    errorMap: () => ({ message: 'layoutId must be a string' }),
  }),
  tabName: z.string({
    errorMap: () => ({ message: 'tabName must be a string' }),
  }),
});

export type TabConfigObject = z.infer<typeof ZodTabConfigObject>;

const ZodTabsConfig = z.array(ZodTabConfigObject);

type TabsConfig = z.infer<typeof ZodTabsConfig>;

const ZodTabsUIElementComponentConfigs = z.object({
  tabs: ZodTabsConfig,
});

export type TabsUIElementComponentConfigs = z.infer<typeof ZodTabsUIElementComponentConfigs>;

@Component({
  selector: 'namnguyen191-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, LayoutComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements UIElementImplementation<TabsUIElementComponentConfigs> {
  static readonly ELEMENT_TYPE = 'TABS';

  isErrorConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'isError',
    transform: inputObsTransform(ZodIsError),
  });

  isLoadingConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'isLoading',
    transform: inputObsTransform(ZodIsLoading),
  });

  tabsConfigOption: InputSignalWithTransform<
    Observable<TabsConfig>,
    TabsConfig | Observable<TabsConfig>
  > = input(of([]), {
    alias: 'tabs',
    transform: inputObsTransform(ZodTabsConfig),
  });
}
