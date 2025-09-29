import { TherapyAppointmentModel } from '@/api';
import { toastError } from '@/utils/errors';
import { addMinutes, dayToString } from '@/utils/time';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TimeInput } from '../TimeInput/TimeInput';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

export type TherapyAppointmentFormProps = {
  client: Client;
  day: number;
  initialStartTime: string;
  instance?: TherapyAppointment;
  onCreate?: (created: TherapyAppointment) => void;
  onUpdate?: (updated: TherapyAppointment) => void;
  onDelete?: (deleted: TherapyAppointment) => void;
};

export type TherapyAppointmentFormData = {
  start_time: string;
  end_time: string;
  therapy_type: string;
  notes?: string;
};

export const TherapyAppointmentForm = ({
  client,
  day,
  initialStartTime,
  instance,
  onCreate,
  onUpdate,
  onDelete,
}: TherapyAppointmentFormProps) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<TherapyAppointmentFormData>();

  React.useEffect(() => {
    // Reset form values when the instance or initialStartTime changes
    if (instance) {
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
        therapy_type: instance.therapy_type,
        notes: instance.notes,
      });
    } else {
      form.reset({
        start_time: initialStartTime,
        end_time: addMinutes(initialStartTime, 60),
        therapy_type: '',
        notes: '',
      });
    }
  }, [instance, initialStartTime, form]);

  function createTherapyAppointment(data: TherapyAppointmentFormData) {
    if (!client) {
      return;
    }
    TherapyAppointmentModel.create({
      client: client?.id,
      day,
      ...data,
    })
      .then((created) => {
        onCreate?.(created.data);
      })
      .catch((err) => {
        toastError(err);
      });
  }

  function updateTherapyAppointment(data: TherapyAppointmentFormData) {
    if (!client || !instance) {
      return;
    }
    TherapyAppointmentModel.update(instance.id, {
      client: client?.id,
      day,
      ...data,
    })
      .then((updated) => {
        onUpdate?.(updated.data);
      })
      .catch((err) => {
        toastError(err);
      });
  }

  function onSubmit(data: TherapyAppointmentFormData) {
    if (instance) {
      updateTherapyAppointment(data);
    } else {
      createTherapyAppointment(data);
    }
  }

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!instance) {
      return;
    }
    TherapyAppointmentModel.delete(instance.id)
      .then(() => {
        onDelete?.(instance);
        setConfirmDelete(false);
      })
      .catch((err) => {
        toastError(err);
      });
  }

  if (confirmDelete) {
    return (
      <div className="flex flex-col gap-4">
        <p>
          Are you sure you want to delete this therapy appointment?
          <br />
          This action cannot be undone.
        </p>
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
      <div className="form-group">
        <Label>Client</Label>
        <Badge>
          {client.first_name} {client.last_name}
        </Badge>
      </div>
      {client.notes && (
        <div className="form-group">
          <Label>Client notes</Label>
          <div className="size-xs bg-muted text-muted-foreground max-h-24 w-full overflow-y-auto rounded p-2 whitespace-pre-wrap">
            {client.notes}
          </div>
        </div>
      )}
      <div className="form-group">
        <Label>Day</Label>
        <Badge>{dayToString(day)}</Badge>
      </div>
      <div className="form-row">
        <Controller
          control={form.control}
          name="start_time"
          render={({ field }) => {
            return (
              <div className="form-group">
                <Label htmlFor="start_time">Start time</Label>
                <TimeInput
                  min="09:00:00"
                  max="19:00:00"
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              </div>
            );
          }}
        />
        <Controller
          control={form.control}
          name="end_time"
          render={({ field }) => {
            return (
              <div className="form-group">
                <Label htmlFor="end_time">End time</Label>
                <TimeInput
                  min={initialStartTime}
                  max="19:00:00"
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              </div>
            );
          }}
        />
      </div>
      <div className="form-group">
        <Label id="therapy_type">Therapy Type</Label>
        <Select id="therapy_type" {...form.register('therapy_type', { required: true })}>
          <option value="">Select a type</option>
          <option value="ot">Occupational Therapy</option>
          <option value="st">Speech Therapy</option>
          <option value="mh">Mental Health</option>
        </Select>
      </div>
      <div className="form-group">
        <Label htmlFor="notes">Notes</Label>
        <Textarea className="resize-none" id="notes" rows={6} {...form.register('notes')} />
      </div>
      <div className="flex items-center justify-between gap-4">
        {instance && (
          <Button
            onClick={() => {
              clickDelete();
            }}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        )}
        <Button disabled={!form.formState.isValid} type="submit">
          {instance ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
