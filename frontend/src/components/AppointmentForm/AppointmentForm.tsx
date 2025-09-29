import { AppointmentModel, ClientModel, TechnicianModel } from '@/api';
import { toastError } from '@/utils/errors';
import { orderByFirstName } from '@/utils/order';
import { dayToString } from '@/utils/time';
import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TimeInput } from '../TimeInput/TimeInput';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type AppointmentFormProps = {
  client: Client;
  day: number;
  block: Block;
  availability?: Availability;
  instance?: Appointment;
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
  in_clinic: boolean;
  is_preschool_or_adaptive: boolean;
};

export const AppointmentForm = ({
  client,
  day,
  block,
  availability,
  instance,
  onCreate,
  onUpdate,
  onDelete,
}: AppointmentFormProps) => {
  const [overrideBlockTimes, setOverrideBlockTimes] = React.useState(false);
  const [availableTechnicians, setAvailableTechnicians] = React.useState<Technician[]>([]);
  const [availableTechniciansLoaded, setAvailableTechniciansLoaded] = React.useState(false);
  const [onlyShowRecommendedTechs, setOnlyShowRecommendedTechs] = React.useState(true);
  const [allTechnicians, setAllTechnicians] = React.useState<Technician[]>([]);
  const [repeatableAppointmentDays, setRepeatableAppointmentDays] = React.useState<number[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const [initialTechnicianSet, setInitialTechnicianSet] = React.useState(false);

  const form = useForm<AppointmentFormData>();

  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');
  const technician = form.watch('technician');
  const inClinic = form.watch('in_clinic');

  React.useEffect(() => {
    // Fetch all technicians on mount
    getAllTechnicians();
  }, []);

  React.useEffect(() => {
    // Reset form values when the instance, availability, or block changes
    if (instance) {
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
        notes: instance.notes,
        in_clinic: instance.in_clinic,
        is_preschool_or_adaptive: instance.is_preschool_or_adaptive,
      });
    } else if (availability) {
      form.reset({
        start_time: availability.start_time,
        end_time: availability.end_time,
        in_clinic: availability.in_clinic,
        is_preschool_or_adaptive: false,
      });
    } else {
      form.reset({
        start_time: block.start_time,
        end_time: block.end_time,
        in_clinic: false,
        is_preschool_or_adaptive: false,
      });
    }
  }, [instance, availability, block]);

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
      },
    )
      .then((technicians) => {
        setAvailableTechnicians(orderByFirstName<Technician>(technicians.data));
      })
      .finally(() => {
        setAvailableTechniciansLoaded(true);
      });
  }

  function getAllTechnicians() {
    TechnicianModel.all({
      page_size: 1000,
    }).then((technicians) => {
      setAllTechnicians(orderByFirstName<Technician>(technicians));
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
      { day, start_time: startTime, end_time: endTime, tech_id: technician },
    ).then((days) => {
      setRepeatableAppointmentDays(days.data);
    });
  }

  function getWarnings() {
    AppointmentModel.listAction(
      'get_warnings',
      'get',
      {},
      {
        appointment_id: instance?.id || undefined,
        client_id: client.id,
        tech_id: technician,
        day,
        start_time: startTime,
        end_time: endTime,
      },
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
        toastError(err);
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
        toastError(err);
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
        toastError(err);
      });
  }

  function isTechnicianAvailable(technicianId: string) {
    return availableTechnicians.some((t) => t.id === technicianId);
  }

  if (confirmDelete) {
    return (
      <div className="flex flex-col gap-4">
        <p>
          Are you sure you want to delete this appointment?
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
          <div className="max-h-24 w-full overflow-y-auto bg-gray-100 p-2 text-xs whitespace-pre-wrap">
            {client.notes}
          </div>
        </div>
      )}
      <div className="form-group">
        <Label>Day</Label>
        <div>{dayToString(day)}</div>
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
                  min={overrideBlockTimes ? '08:00:00' : block.start_time}
                  max={overrideBlockTimes ? '20:00:00' : block.end_time}
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
                  min={overrideBlockTimes ? '08:00:00' : block.start_time}
                  max={overrideBlockTimes ? '20:00:00' : block.end_time}
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
        <div className="flex items-center gap-2">
          <Checkbox
            checked={overrideBlockTimes}
            id="override_block_times"
            onCheckedChange={() => {
              setOverrideBlockTimes((prev) => !prev);
            }}
          />
          <Label htmlFor="override_block_times">Override block times</Label>
        </div>
        <p className="text-muted-foreground text-xs">
          Check to allow setting start and end times outside of the block times.
        </p>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="in_clinic"
            render={({ field }) => (
              <Checkbox id="in_clinic" checked={field.value} onCheckedChange={() => field.onChange(!field.value)} />
            )}
          />
          <Label htmlFor="in_clinic">In clinic</Label>
        </div>
        {inClinic && availability && !availability.in_clinic && (
          <div className="flex items-center gap-1 text-xs text-orange-700">
            <AlertTriangle size="16" /> Client is not available in clinic
          </div>
        )}
        {!inClinic && availability && availability.in_clinic && (
          <div className="flex items-center gap-1 text-xs text-orange-700">
            <AlertTriangle size="16" /> Client is available in clinic
          </div>
        )}
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="is_preschool_or_adaptive"
            render={({ field }) => (
              <Checkbox
                id="is_preschool_or_adaptive"
                checked={field.value}
                onCheckedChange={() => field.onChange(!field.value)}
              />
            )}
          />
          <Label htmlFor="is_preschool_or_adaptive">Preschool/Adaptive</Label>
        </div>
      </div>
      <div className="form-group">
        <Label htmlFor="technician">Technician</Label>
        <Select id="technician" {...form.register('technician', { required: true })}>
          <option value="">Select a technician</option>
          {(onlyShowRecommendedTechs ? availableTechnicians : allTechnicians).map((tech) => (
            <option
              key={tech.id}
              className={clsx({
                'text-red-700': !isTechnicianAvailable(tech.id),
              })}
              value={tech.id}
            >
              {tech.first_name} {tech.last_name} {!isTechnicianAvailable(tech.id) ? '⚠' : ''}
            </option>
          ))}
        </Select>
      </div>
      <div className="form-group">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={onlyShowRecommendedTechs}
            id="only_show_recommended_techs"
            onCheckedChange={() => setOnlyShowRecommendedTechs(!onlyShowRecommendedTechs)}
          />
          <Label htmlFor="only_show_recommended_techs">Recommended techs only</Label>
        </div>
      </div>
      {!instance && technician && (
        <Controller
          control={form.control}
          name="repeats"
          render={({ field }) => (
            <>
              <div className="flex items-center gap-2">
                <Label>Repeats</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle size="16" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="w-70 text-xs">
                      <strong>Note</strong>: Warnings are only shown for the current appointment!
                      <br />
                      Creating repeated appointments can result in unintended conflicts such as over booking the
                      technician or client.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-1">
                {['Mon', 'Tue', 'Wed', 'Thur', 'Fri'].map(
                  (dayStr, index) =>
                    index !== day && (
                      <Button
                        key={index}
                        disabled={!repeatableAppointmentDays.includes(index)}
                        onClick={() => {
                          const selectedDays = field.value || [];
                          if (selectedDays.includes(index)) {
                            field.onChange(selectedDays.filter((d) => d !== index));
                          } else {
                            field.onChange([...selectedDays, index]);
                          }
                        }}
                        size="sm"
                        title={!repeatableAppointmentDays.includes(index) ? 'Client or technician not available' : ''}
                        type="button"
                        variant={field.value?.includes(index) ? 'default' : 'ghost'}
                      >
                        {dayStr}
                      </Button>
                    ),
                )}
              </div>
            </>
          )}
        />
      )}
      <div className="form-group">
        <Label htmlFor="notes">Appointment notes</Label>
        <Textarea className="resize-none" id="notes" rows={6} {...form.register('notes')} />
      </div>
      <ul className="ml-4 list-disc text-xs text-red-700">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
      <div className="flex items-center">
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
        <div className="flex-1"></div>
        <Button disabled={!form.formState.isValid} type="submit">
          {instance ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
