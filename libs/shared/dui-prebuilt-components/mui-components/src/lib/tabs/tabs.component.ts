import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import {
  BaseUIElementComponent,
  LayoutComponent,
  UIElementImplementation,
} from '@namnguyen191/dui-core';
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
export class TabsComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<TabsUIElementComponentConfigs>
{
  static readonly ELEMENT_TYPE = 'TABS';

  tabsConfigOption: InputSignal<TabsConfig> = input([], {
    alias: 'tabs',
    transform: (val) => ZodTabsConfig.parse(val),
  });
}
