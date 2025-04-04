import React from 'react';
import { useForm } from 'react-hook-form';
import { AppointmentModel, ClientModel } from '~/api';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Checkbox, Input, RadixDialog, RadixDialogProps, Select, Textarea, useToast } from '~/ui';
import './CreateAppointment.scss';

export type CreateAppointmentProps = RadixDialogProps & {
  client?: Client;
  day?: number;
  initialStartTime?: string;
  initialEndTime?: string;
  onSuccess?: () => void;
};

export type CreateAppointmentForm = {
  start_time: string;
  end_time: string;
  technician: string;
  // repeats?: number[];
  notes?: string;
  in_clinic?: boolean;
};

export const CreateAppointment = ({
  client,
  day,
  initialStartTime,
  initialEndTime,
  onSuccess,
  ...rest
}: CreateAppointmentProps) => {
  const [availableTechnicians, setAvailableTechnicians] = React.useState<Technician[]>([]);

  const form = useForm<CreateAppointmentForm>();
  const toast = useToast();

  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');

  React.useEffect(() => {
    if (!startTime || !endTime) {
      return;
    }
    // TODO: This sometimes has a race condition!  Needs to be fixed ASAP.
    getAvailableTechnicians();
  }, [client, day, startTime, endTime]);

  React.useEffect(() => {
    if (rest.open) {
      form.reset({
        start_time: initialStartTime,
        end_time: initialEndTime,
      });
    }
  }, [rest.open]);

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
      }
    ).then((technicians) => {
      setAvailableTechnicians(technicians.data as Technician[]);
    });
  }

  function createAppointment(data: CreateAppointmentForm) {
    if (!client) {
      return;
    }
    AppointmentModel.create({
      client: client?.id,
      day,
      ...data,
    })
      .then(() => {
        onSuccess?.();
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  return (
    <RadixDialog {...rest}>
      <div className="CreateAppointment">
        <h3 className="mb-4">Create Appointment</h3>
        <form className="CreateAppointment__form" onSubmit={form.handleSubmit(createAppointment)}>
          <div className="CreateAppointment__form__row">
            <Input fluid label="Start time" type="time" {...form.register('start_time', { required: true })} />
            <Input fluid label="End time" type="time" {...form.register('end_time', { required: true })} />
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
          <Textarea fluid label="Notes" {...form.register('notes')} />
          <div className="CreateAppointment__form__actions">
            <Button color="primary" disabled={!form.formState.isValid} type="submit" variant="raised">
              Create Appointment
            </Button>
          </div>
        </form>
      </div>
    </RadixDialog>
  );
};
