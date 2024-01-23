import { SettingRow, supabase } from './supabase';

export const getSettings = async (): Promise<SettingRow> => {
  const { data, error } = await supabase.from('settings').select('*').single();

  if (error) {
    console.error(error);
    throw new Error('Settings could not be loaded');
  }
  return data;
};

// We expect a newSetting object that looks like {setting: newValue} without the id
// There is only ONE row of settings, and it has the ID=1, and so this is the updated one
export type UpdateSettingsPayload = Omit<Partial<SettingRow>, 'id'>;
export const updateSettings = async (newSetting: UpdateSettingsPayload): Promise<void> => {
  const { error } = await supabase.from('settings').update(newSetting).eq('id', 1).select();

  if (error) {
    console.error(error);
    throw new Error('Settings could not be updated');
  }
};
