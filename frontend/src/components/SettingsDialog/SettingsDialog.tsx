import { UserModel } from '@/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Checkbox } from '@/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
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
        <form className="SettingsDialog__form" onSubmit={form.handleSubmit(save)}>
          <div>
            <Checkbox label="Enable Hover Cards" inputSize="xs" {...form.register('hover_cards_enabled')} />
            <p className="text-muted-foreground mt-2 text-xs">
              Enable hover cards for quick info on users and events (default enabled).
            </p>
          </div>
          <div className="SettingsDialog__form__actions">
            <Button onClick={props.onClose} type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </>
  );
};
