import { TherapyAppointmentModel } from '@/api';
import { Client } from '@/types/Client';
import { TherapyAppointment } from '@/types/TherapyAppointment';
import { Badge, Button, Select, Textarea, TimeInput, useToast } from '@/ui';
import { addMinutes, dayToString } from '@/utils/time';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import './TherapyAppointmentForm.scss';

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
  const toast = useToast();

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
  }, [instance, initialStartTime]);

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
        toast.errorResponse(err);
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
        toast.errorResponse(err);
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
        toast.errorResponse(err);
      });
  }

  if (confirmDelete) {
    return (
      <div className="TherapyAppointmentForm__confirmDelete">
        <p>
          Are you sure you want to delete this therapy appointment?
          <br />
          This action cannot be undone.
        </p>
        <div className="TherapyAppointmentForm__confirmDelete__actions">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="red" onClick={clickConfirmDelete} variant="raised">
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="TherapyAppointmentForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="TherapyAppointmentForm__row">
        <div className="Input__container">
          <label>Client</label>
          <Badge size="xs">
            {client.first_name} {client.last_name}
          </Badge>
        </div>
      </div>
      {client.notes && (
        <div className="TherapyAppointmentForm__row TherapyAppointmentForm__row--notes">
          <div className="Input__container">
            <label>Client notes</label>
            <div className="TherapyAppointmentForm__notes">{client.notes}</div>
          </div>
        </div>
      )}
      <div className="TherapyAppointmentForm__row">
        <div className="Input__container">
          <label>Day</label>
          <p>{dayToString(day)}</p>
        </div>
      </div>
      <div className="TherapyAppointmentForm__row">
        <Controller
          control={form.control}
          name="start_time"
          render={({ field }) => {
            return (
              <TimeInput
                inputProps={{
                  fluid: true,
                  id: 'start_time',
                  label: 'Start time',
                }}
                min="09:00:00"
                max="19:00:00"
                onChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
              />
            );
          }}
        />
        <Controller
          control={form.control}
          name="end_time"
          render={({ field }) => {
            return (
              <TimeInput
                inputProps={{
                  fluid: true,
                  id: 'end_time',
                  label: 'End time',
                }}
                min={initialStartTime}
                max="19:00:00"
                onChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
              />
            );
          }}
        />
      </div>
      <Select fluid label="Therapy Type" {...form.register('therapy_type', { required: true })}>
        <option value="">Select a type</option>
        <option value="ot">Occupational Therapy</option>
        <option value="st">Speech Therapy</option>
        <option value="mh">Mental Health</option>
      </Select>
      <Textarea fluid label="Appointment notes" rows={6} {...form.register('notes')} />
      <div className="TherapyAppointmentForm__actions">
        {instance && (
          <Button
            color="red"
            onClick={() => {
              clickDelete();
            }}
          >
            Delete
          </Button>
        )}
        <div className="flex-1"></div>
        <Button color="primary" disabled={!form.formState.isValid} type="submit" variant="raised">
          {instance ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
