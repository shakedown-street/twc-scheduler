import clsx from 'clsx';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppointmentModel, ClientModel, TechnicianModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, IconButton, RadixTooltip, Select, Textarea, TimeInput, Toggle, useToast } from '~/ui';
import './AppointmentForm.scss';

export type AppointmentFormProps = {
  instance?: Appointment;
  client: Client;
  day: number;
  initialStartTime: string;
  initialEndTime: string;
  minTime: string;
  maxTime: string;
  onCreate?: (created: Appointment[]) => void;
  onUpdate?: (updated: Appointment) => void;
  onDelete?: (deleted: Appointment) => void;
};

export type AppointmentFormData = {
  start_time: string;
  end_time: string;
  technician: string;
  repeats?: number[];
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
  const [availableTechniciansLoaded, setAvailableTechniciansLoaded] = React.useState(false);
  const [onlyShowRecommendedTechs, setOnlyShowRecommendedTechs] = React.useState(true);
  const [allTechnicians, setAllTechnicians] = React.useState<Technician[]>([]);
  const [repeatableAppointmentDays, setRepeatableAppointmentDays] = React.useState<number[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const [initialTechnicianSet, setInitialTechnicianSet] = React.useState(false);

  const form = useForm<AppointmentFormData>();
  const toast = useToast();

  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');
  const technician = form.watch('technician');

  React.useEffect(() => {
    // Fetch all technicians on mount
    getAllTechnicians();
  }, []);

  React.useEffect(() => {
    // Reset form values when the instance changes
    if (instance) {
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
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
    // Get available technicians when any of the relevant values change
    if (!startTime || !endTime) {
      return;
    }
    getAvailableTechnicians();
  }, [client, day, startTime, endTime]);

  React.useEffect(() => {
    // Get repeatable appointment days and warnings when any of the relevant values change
    setRepeatableAppointmentDays([]);
    setWarnings([]);
    form.setValue('repeats', []);
    if (!client || !technician || !startTime || !endTime) {
      return;
    }
    getRepeatableAppointmentDays();
    getWarnings();
  }, [technician, startTime, endTime, client, day]);

  React.useEffect(() => {
    // Clear selected technician when show all technicians is toggled
    // and the selected technician is not available
    if (!technician) {
      return;
    }
    if (onlyShowRecommendedTechs && !isTechnicianAvailable(technician)) {
      form.setValue('technician', '', {
        shouldValidate: true,
      });
    }
  }, [onlyShowRecommendedTechs]);

  React.useEffect(() => {
    // Set the form technician value on load if not editing

    // If not editing, do not do anything
    if (!instance || !instance.technician) {
      return;
    }

    // If we've already set the technician, do not do anything
    if (initialTechnicianSet) {
      return;
    }

    // Wait until we have fetched available technicians
    if (!availableTechniciansLoaded) {
      return;
    }

    form.setValue('technician', instance.technician.id, {
      shouldValidate: true,
    });
    setInitialTechnicianSet(true);
  }, [availableTechnicians, instance]);

  function getAvailableTechnicians() {
    if (!client) {
      return;
    }
    setAvailableTechniciansLoaded(false);
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
    )
      .then((technicians) => {
        setAvailableTechnicians(technicians.data as Technician[]);
      })
      .finally(() => {
        setAvailableTechniciansLoaded(true);
      });
  }

  function getAllTechnicians() {
    TechnicianModel.all().then((technicians) => {
      setAllTechnicians(technicians);
    });
  }

  function getRepeatableAppointmentDays() {
    if (!client) {
      return;
    }
    ClientModel.detailAction(
      client.id,
      'get_repeatable_appointment_days',
      'get',
      {},
      { day, start_time: startTime, end_time: endTime, tech_id: technician }
    ).then((days) => {
      setRepeatableAppointmentDays(days.data);
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
        // NOTE: The appointment create endpoint returns an array instead of a single
        // appointment, to support repeat appointments
        onCreate?.(created.data as any as Appointment[]);
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

  function isTechnicianAvailable(technicianId: string) {
    return availableTechnicians.some((t) => t.id === technicianId);
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
      <Toggle labelPosition="right" label="In clinic" {...form.register('in_clinic')} />
      <Toggle
        checked={onlyShowRecommendedTechs}
        label="Recommended Techs Only"
        labelPosition="right"
        onChange={() => setOnlyShowRecommendedTechs(!onlyShowRecommendedTechs)}
      />
      <Select fluid label="Technician" {...form.register('technician', { required: true })}>
        <option value="">Select a technician</option>
        {(onlyShowRecommendedTechs ? availableTechnicians : allTechnicians).map((tech) => (
          <option
            key={tech.id}
            className={clsx({
              'AppointmentForm__technician--unavailable': !isTechnicianAvailable(tech.id),
            })}
            value={tech.id}
          >
            {tech.first_name} {tech.last_name} {!isTechnicianAvailable(tech.id) ? '⚠' : ''}
          </option>
        ))}
      </Select>
      {!instance && technician && (
        <Controller
          control={form.control}
          name="repeats"
          render={({ field }) => (
            <div className="Input__container">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Repeats
                <RadixTooltip
                  side="right"
                  portal
                  trigger={
                    <IconButton radius="full" size="xs">
                      <span className="material-symbols-outlined">help</span>
                    </IconButton>
                  }
                >
                  <div className="text-size-xs" style={{ lineHeight: '1.5', width: '24rem' }}>
                    <strong>Note</strong>: Warnings are only shown for the current appointment!
                    <br />
                    Creating repeated appointments can result in unintended conflicts such as over booking the
                    technician or client.
                  </div>
                </RadixTooltip>
              </label>
              <div className="flex gap-1">
                {['Mon', 'Tue', 'Wed', 'Thur', 'Fri'].map(
                  (dayStr, index) =>
                    index !== day && (
                      <Button
                        key={index}
                        color="primary"
                        disabled={!repeatableAppointmentDays.includes(index)}
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
                        title={!repeatableAppointmentDays.includes(index) ? 'Not available' : ''}
                        variant={field.value?.includes(index) ? 'raised' : 'default'}
                      >
                        {dayStr}
                      </Button>
                    )
                )}
              </div>
            </div>
          )}
        />
      )}
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
