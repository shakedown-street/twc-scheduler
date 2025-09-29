import { UserModel } from '@/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Info } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
      <form className="form" onSubmit={form.handleSubmit(save)}>
        <div className="form-group">
          <div className="flex items-center gap-2">
            <Controller
              control={form.control}
              name="hover_cards_enabled"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  id="hover_cards_enabled"
                  onCheckedChange={() => field.onChange(!field.value)}
                />
              )}
            />
            <Label htmlFor="hover_cards_enabled">
              Enable Hover Cards
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size="16" />
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  Enable hover cards for quick info on users and events (default enabled).
                </TooltipContent>
              </Tooltip>
            </Label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={props.onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </>
  );
};
