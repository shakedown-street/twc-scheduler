import { ClientModel } from '@/api';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toastError } from '@/utils/errors';
import { Info } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { NativeSelect } from '../ui/native-select';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type ClientFormProps = {
  client?: Client;
  onCancel?: () => void;
  onCreate?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onUpdate?: (client: Client) => void;
};

export type ClientFormData = {
  first_name: string;
  last_name: string;
  eval_done: boolean;
  is_onboarding: boolean;
  prescribed_hours: number;
  req_skill_level: number;
  req_spanish_speaking: boolean;
  notes: string;
  sub_notes: string;
  past_technicians: string[];
  is_manually_maxed_out: boolean;
};

export const ClientForm = ({ client, onCancel, onCreate, onDelete, onUpdate }: ClientFormProps) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<ClientFormData>();
  const { technicians } = useSchedule();

  React.useEffect(() => {
    if (!client) {
      return;
    }
    form.reset({
      first_name: client.first_name,
      last_name: client.last_name,
      eval_done: client.eval_done,
      is_onboarding: client.is_onboarding,
      prescribed_hours: client.prescribed_hours,
      req_skill_level: client.req_skill_level,
      req_spanish_speaking: client.req_spanish_speaking,
      notes: client.notes,
      sub_notes: client.sub_notes,
      past_technicians: client.past_technicians.map((tech) => tech.id),
      is_manually_maxed_out: client.is_manually_maxed_out,
    });
  }, [client, form]);

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!client) {
      return;
    }
    ClientModel.delete(client.id)
      .then(() => {
        onDelete?.(client);
        setConfirmDelete(false);
      })
      .catch((err) => {
        toastError(err);
      });
  }

  function onSubmit(data: ClientFormData) {
    if (client) {
      ClientModel.update(client.id, data)
        .then((updated) => {
          onUpdate?.(updated.data);
        })
        .catch((err) => {
          toastError(err);
        });
      return;
    }
    ClientModel.create(data)
      .then((created) => {
        onCreate?.(created.data);
      })
      .catch((err) => {
        toastError(err);
      });
  }

  if (confirmDelete) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          Are you sure you want to delete {client?.first_name} {client?.last_name}?
          <br />
          This action cannot be undone.
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={clickConfirmDelete} variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-row">
        <div className="form-group">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...form.register('first_name', { required: true })} />
        </div>
        <div className="form-group">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" {...form.register('last_name', { required: true })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <Label htmlFor="prescribed_hours">Prescribed Hours</Label>
          <Input id="prescribed_hours" type="number" {...form.register('prescribed_hours', { required: true })} />
        </div>
        <div className="form-group">
          <Label htmlFor="req_skill_level">Required Skill Level</Label>
          <Input
            id="req_skill_level"
            min={1}
            max={3}
            type="number"
            {...form.register('req_skill_level', { required: true })}
          />
        </div>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="req_spanish_speaking"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                id="req_spanish_speaking"
                onCheckedChange={() => field.onChange(!field.value)}
              />
            )}
          />
          <Label htmlFor="req_spanish_speaking">Require Spanish Speaking</Label>
        </div>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="eval_done"
            render={({ field }) => (
              <Checkbox checked={field.value} id="eval_done" onCheckedChange={() => field.onChange(!field.value)} />
            )}
          />
          <Label htmlFor="eval_done">Evaluation Done</Label>
        </div>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="is_onboarding"
            render={({ field }) => (
              <Checkbox checked={field.value} id="is_onboarding" onCheckedChange={() => field.onChange(!field.value)} />
            )}
          />
          <Label htmlFor="is_onboarding">Currently Onboarding</Label>
        </div>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="is_manually_maxed_out"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                id="is_manually_maxed_out"
                onCheckedChange={() => field.onChange(!field.value)}
              />
            )}
          />
          <Label htmlFor="is_manually_maxed_out">
            Manually Maxed Out
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size="16" />
              </TooltipTrigger>
              <TooltipContent className="w-64">
                If checked, this client will be considered maxed out on sessions regardless of their total hours.
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
      </div>
      <div className="form-group">
        <Label htmlFor="notes">Notes</Label>
        <Textarea className="resize-none" id="notes" rows={3} {...form.register('notes')} />
      </div>
      <div className="form-group">
        <Label htmlFor="sub_notes">Sub Notes</Label>
        <Textarea
          className="resize-none"
          id="sub_notes"
          placeholder='E.g. "No males"'
          rows={3}
          {...form.register('sub_notes')}
        />
      </div>
      {technicians.length > 0 && (
        <div className="form-group">
          <Label htmlFor="past_technicians">Past Technicians</Label>
          <NativeSelect className="h-30" id="past_technicians" multiple {...form.register('past_technicians')}>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.first_name} {technician.last_name}
              </option>
            ))}
          </NativeSelect>
          <div className="text-muted-foreground text-xs">
            Hold down “Control”, or “Command” on a Mac, to select more than one.
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        {client && (
          <Button onClick={clickDelete} type="button" variant="destructive">
            Delete
          </Button>
        )}
        <div className="flex-1"></div>
        <Button onClick={() => onCancel?.()} type="button" variant="ghost">
          Cancel
        </Button>
        <Button disabled={!form.formState.isValid} type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};
