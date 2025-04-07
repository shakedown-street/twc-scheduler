import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppointmentModel, ClientModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Checkbox, Select, Textarea, TimeInput, useToast } from '~/ui';
import './AppointmentForm.scss';

export type AppointmentFormProps = {
  instance?: Appointment;
  client: Client;
  day: number;
  initialStartTime: string;
  initialEndTime: string;
  minTime: string;
  maxTime: string;
  onCreate?: (created: Appointment) => void;
  onUpdate?: (updated: Appointment) => void;
  onDelete?: (deleted: Appointment) => void;
};

export type AppointmentFormData = {
  start_time: string;
  end_time: string;
  technician: string;
  // repeats?: number[];
  notes?: string;
  in_clinic?: boolean;
};

export const AppointmentForm = ({
  instance,
  client,
  day,
  initialStartTime,
  initialEndTime,
  minTime,
  maxTime,
  onCreate,
  onUpdate,
  onDelete,
}: AppointmentFormProps) => {
  const [availableTechnicians, setAvailableTechnicians] = React.useState<Technician[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<AppointmentFormData>();
  const toast = useToast();

  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');
  const technician = form.watch('technician');

  React.useEffect(() => {
    if (instance) {
      // TODO: Technician should be selected by default, currently this is a race condition
      // since available technicians need to be fetched first
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
        technician: instance.technician?.id,
        notes: instance.notes,
        in_clinic: instance.in_clinic,
      });
    } else {
      form.reset({
        start_time: initialStartTime,
        end_time: initialEndTime,
      });
    }
  }, [instance, initialStartTime, initialEndTime]);

  React.useEffect(() => {
    if (!startTime || !endTime) {
      return;
    }
    getAvailableTechnicians();
  }, [client, day, startTime, endTime]);

  React.useEffect(() => {
    if (!client || !technician || !startTime || !endTime) {
      return;
    }
    getWarnings();
  }, [technician, startTime, endTime, client, day]);

  function getAvailableTechnicians() {
    if (!client) {
      return;
    }

    ClientModel.detailAction(
      client.id,
      'available_techs',
      'get',
      {},
      {
        day: day,
        start_time: startTime,
        end_time: endTime,
        appointment: instance ? instance.id : undefined,
      }
    ).then((technicians) => {
      setAvailableTechnicians(technicians.data as Technician[]);
    });
  }

  function getWarnings() {
    if (!instance) {
      getCreateWarnings();
    } else {
      getUpdateWarnings();
    }
  }

  function getCreateWarnings() {
    ClientModel.detailAction(
      client?.id,
      'get_create_warnings',
      'get',
      {},
      {
        tech_id: technician,
        day,
        start_time: startTime,
        end_time: endTime,
      }
    ).then((warnings) => {
      setWarnings(warnings.data);
    });
  }

  function getUpdateWarnings() {
    if (!instance) {
      return;
    }
    AppointmentModel.detailAction(
      instance.id,
      'get_update_warnings',
      'get',
      {},
      {
        tech_id: technician,
        day,
        start_time: startTime,
        end_time: endTime,
      }
    ).then((warnings) => {
      setWarnings(warnings.data);
    });
  }

  function createAppointment(data: AppointmentFormData) {
    if (!client) {
      return;
    }
    AppointmentModel.create({
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

  function updateAppointment(data: AppointmentFormData) {
    if (!client || !instance) {
      return;
    }
    AppointmentModel.update(instance.id, {
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

  function onSubmit(data: AppointmentFormData) {
    if (instance) {
      updateAppointment(data);
    } else {
      createAppointment(data);
    }
  }

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!instance) {
      return;
    }
    AppointmentModel.delete(instance.id)
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
      <div className="AppointmentForm__confirmDelete">
        <p>
          Are you sure you want to delete this appointment?
          <br />
          This action cannot be undone.
        </p>
        <div className="AppointmentForm__confirmDelete__actions">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="red" onClick={clickConfirmDelete} variant="raised">
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="AppointmentForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="AppointmentForm__row">
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
                min={minTime}
                max={maxTime}
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
                min={minTime}
                max={maxTime}
                onChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
              />
            );
          }}
        />
      </div>
      <Checkbox label="In clinic" {...form.register('in_clinic')} />
      <Select fluid label="Technician" {...form.register('technician', { required: true })}>
        <option value="">Select a technician</option>
        {availableTechnicians.map((technician) => (
          <option key={technician.id} value={technician.id}>
            {technician.first_name} {technician.last_name}
          </option>
        ))}
      </Select>
      {/* <Controller
        control={form.control}
        name="repeats"
        render={({ field }) => (
          <div className="Input__container">
            <label>Repeats</label>
            <div className="flex gap-1">
              {['M', 'T', 'W', 'TH', 'F'].map((day, index) => (
                <Button
                  key={index}
                  color="primary"
                  onClick={() => {
                    const selectedDays = field.value || [];
                    if (selectedDays.includes(index)) {
                      field.onChange(selectedDays.filter((d) => d !== index));
                    } else {
                      field.onChange([...selectedDays, index]);
                    }
                  }}
                  radius="sm"
                  size="xs"
                  variant={field.value?.includes(index) ? 'raised' : 'default'}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}
      /> */}
      <Textarea fluid label="Notes" rows={6} {...form.register('notes')} />
      <ul className="AppointmentForm__warnings">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
      <div className="AppointmentForm__actions">
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
