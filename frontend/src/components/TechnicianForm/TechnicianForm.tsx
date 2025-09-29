import { TechnicianModel } from '@/api';
import { toastError } from '@/utils/errors';
import { Info } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type TechnicianFormProps = {
  technician?: Technician;
  onCancel?: () => void;
  onCreate?: (technician: Technician) => void;
  onDelete?: (technician: Technician) => void;
  onUpdate?: (technician: Technician) => void;
};

export type TechnicianFormData = {
  first_name: string;
  last_name: string;
  bg_color: string;
  text_color: string;
  requested_hours: number;
  max_hours_per_day: number;
  skill_level: number;
  spanish_speaking: boolean;
  notes: string;
  is_manually_maxed_out: boolean;
};

export const TechnicianForm = ({ technician, onCancel, onCreate, onDelete, onUpdate }: TechnicianFormProps) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<TechnicianFormData>();

  const backgroundColor = form.watch('bg_color');
  const textColor = form.watch('text_color');

  React.useEffect(() => {
    if (!technician) {
      return;
    }
    form.reset({
      first_name: technician.first_name,
      last_name: technician.last_name,
      bg_color: technician.bg_color,
      text_color: technician.text_color,
      requested_hours: technician.requested_hours,
      max_hours_per_day: technician.max_hours_per_day,
      skill_level: technician.skill_level,
      spanish_speaking: technician.spanish_speaking,
      notes: technician.notes,
      is_manually_maxed_out: technician.is_manually_maxed_out || false,
    });
  }, [technician, form.reset]);

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!technician) {
      return;
    }
    TechnicianModel.delete(technician.id)
      .then(() => {
        onDelete?.(technician);
        setConfirmDelete(false);
      })
      .catch((err) => {
        toastError(err);
      });
  }

  function onSubmit(data: TechnicianFormData) {
    if (technician) {
      TechnicianModel.update(technician.id, data)
        .then((updated) => {
          onUpdate?.(updated.data);
        })
        .catch((err) => {
          toastError(err);
        });
      return;
    }
    TechnicianModel.create(data)
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
          Are you sure you want to delete {technician?.first_name} {technician?.last_name}?
          <br />
          This action cannot be undone.
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={() => setConfirmDelete(false)} variant="ghost">
            Cancel
          </Button>
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
          <Label htmlFor="requested_hours">Requested Hours Per Week</Label>
          <Input id="requested_hours" type="number" {...form.register('requested_hours', { required: true })} />
        </div>
        <div className="form-group">
          <Label htmlFor="max_hours_per_day">Max Hours Per Day</Label>
          <Input id="max_hours_per_day" type="number" {...form.register('max_hours_per_day', { required: true })} />
        </div>
      </div>
      <div className="form-group">
        <Label htmlFor="skill_level">Skill Level</Label>
        <Input id="skill_level" min={1} max={3} type="number" {...form.register('skill_level', { required: true })} />
        <div className="text-muted-foreground text-xs">Skill level from 1-3</div>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="spanish_speaking"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                id="spanish_speaking"
                onCheckedChange={() => field.onChange(!field.value)}
              />
            )}
          />
          <Label htmlFor="spanish_speaking">Spanish Speaking</Label>
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
                If checked, this technician will be considered maxed out on sessions regardless of their total hours.
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <Label htmlFor="bg_color">BG Color</Label>
          <Input id="bg_color" type="color" {...form.register('bg_color', { required: true })} />
        </div>
        <div className="form-group">
          <Label htmlFor="text_color">Font Color</Label>
          <Input id="text_color" type="color" {...form.register('text_color', { required: true })} />
        </div>
        <div className="form-group">
          <Label>Preview</Label>
          <Badge
            style={{
              background: backgroundColor,
              color: textColor,
            }}
          >
            Preview
          </Badge>
        </div>
      </div>
      <div className="form-group">
        <Label htmlFor="notes">Notes</Label>
        <Textarea className="resize-none" id="notes" rows={3} {...form.register('notes')} />
      </div>
      <div className="flex items-center gap-4">
        {technician && (
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
