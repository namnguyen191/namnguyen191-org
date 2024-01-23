import { FC, FocusEvent } from 'react';

import { UpdateSettingsPayload } from '../../services/apiSettings';
import { Form } from '../../ui/Form';
import { FormRow } from '../../ui/FormRow';
import { Input } from '../../ui/Input';
import { Spinner } from '../../ui/Spinner';
import { useSettings, useUpdateSettings } from './settingQueryHooks';

export const UpdateSettingsForm: FC = () => {
  const { isLoadingSettings, settings } = useSettings();
  const { isUpdatingSettings, updateSettings } = useUpdateSettings();

  if (isLoadingSettings) {
    return <Spinner />;
  }

  if (!settings) {
    return <span>Something went wrong getting settings</span>;
  }

  const { min_booking_length, max_booking_length, max_guests_per_booking, breakfast_price } =
    settings;

  const handleUpdateSettings = (
    e: FocusEvent<HTMLInputElement, Element>,
    settingKey: keyof UpdateSettingsPayload
  ): void => {
    const val = e.target.value;
    if (!val) {
      return;
    }
    updateSettings({
      [settingKey]: val,
    });
  };

  return (
    <Form type="sd">
      <FormRow label="Minimum nights/booking">
        <Input
          disabled={isUpdatingSettings}
          type="number"
          id="min-nights"
          defaultValue={min_booking_length}
          onBlur={(e) => handleUpdateSettings(e, 'min_booking_length')}
        />
      </FormRow>
      <FormRow label="Maximum nights/booking">
        <Input
          disabled={isUpdatingSettings}
          type="number"
          id="max-nights"
          defaultValue={max_booking_length}
          onBlur={(e) => handleUpdateSettings(e, 'max_booking_length')}
        />
      </FormRow>
      <FormRow label="Maximum guests/booking">
        <Input
          disabled={isUpdatingSettings}
          type="number"
          id="max-guests"
          defaultValue={max_guests_per_booking}
          onBlur={(e) => handleUpdateSettings(e, 'max_guests_per_booking')}
        />
      </FormRow>
      <FormRow label="Breakfast price">
        <Input
          disabled={isUpdatingSettings}
          type="number"
          id="breakfast-price"
          defaultValue={breakfast_price}
          onBlur={(e) => handleUpdateSettings(e, 'breakfast_price')}
        />
      </FormRow>
    </Form>
  );
};
