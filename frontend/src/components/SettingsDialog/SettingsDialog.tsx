import { UserModel } from '@/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Button, Checkbox } from '@/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import './SettingsDialog.scss';

export type SettingsDialogProps = {
  onClose: () => void;
};

export type SettingsFormData = {
  hover_cards_enabled: boolean;
};

export const SettingsDialog = (props: SettingsDialogProps) => {
  const form = useForm<SettingsFormData>();
  const { user, setUser } = useAuth();

  React.useEffect(() => {
    if (!user) {
      return;
    }
    form.setValue('hover_cards_enabled', user.hover_cards_enabled ?? false);
  }, [user]);

  async function save(data: SettingsFormData) {
    if (!user) {
      return;
    }
    const updatedUser = await UserModel.update(user.id, data);
    setUser(updatedUser.data);
    props.onClose();
  }

  return (
    <>
      <div className="SettingsDialog">
        <h2>Settings</h2>
        <form className="SettingsDialog__form" onSubmit={form.handleSubmit(save)}>
          <div>
            <Checkbox label="Enable Hover Cards" inputSize="xs" {...form.register('hover_cards_enabled')} />
            <p className="hint mt-2">Enable hover cards for quick info on users and events (default enabled).</p>
          </div>
          <div className="SettingsDialog__form__actions">
            <Button onClick={props.onClose}>Cancel</Button>
            <Button color="primary" type="submit" variant="raised">
              Save
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
