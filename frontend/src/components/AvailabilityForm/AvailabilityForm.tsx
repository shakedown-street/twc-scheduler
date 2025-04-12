import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AvailabilityModel, ClientModel, TechnicianModel } from '~/api';
import { Availability } from '~/types/Availability';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Badge, Button, Checkbox, TimeInput, useToast } from '~/ui';
import { dayToString } from '~/utils/time';
import './AvailabilityForm.scss';

export type AvailabilityFormProps = {
  instance?: Availability;
  contentType: 'client' | 'technician';
  object: Client | Technician;
  day: number;
  initialStartTime: string;
  initialEndTime: string;
  onCreate?: (object: Client | Technician, created: Availability) => void;
  onUpdate?: (object: Client | Technician, updated: Availability) => void;
  onDelete?: (deleted: Availability) => void;
};

export type AvailabilityFormData = {
  start_time: string;
  end_time: string;
  in_clinic?: boolean;
};

export const AvailabilityForm = ({
  instance,
  contentType,
  object,
  day,
  initialStartTime,
  initialEndTime,
  onCreate,
  onUpdate,
  onDelete,
}: AvailabilityFormProps) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<AvailabilityFormData>();
  const toast = useToast();

  React.useEffect(() => {
    if (instance) {
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
        in_clinic: instance.in_clinic,
      });
    } else {
      form.reset({
        start_time: initialStartTime,
        end_time: initialEndTime,
      });
    }
  }, [instance, initialStartTime, initialEndTime]);

  function getModelForContentType() {
    if (contentType === 'client') {
      return ClientModel;
    } else if (contentType === 'technician') {
      return TechnicianModel;
    }
    throw new Error('Invalid content type');
  }

  function createAvailability(data: AvailabilityFormData) {
    if (!object) {
      return;
    }
    const model = getModelForContentType();

    model
      .detailAction(object.id, 'create_availability', 'post', {
        day,
        ...data,
      })
      .then((created) => {
        onCreate?.(object, created.data);
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  function updateAvailability(data: AvailabilityFormData) {
    if (!object || !instance) {
      return;
    }
    AvailabilityModel.update(instance.id, {
      ...data,
    })
      .then((updated) => {
        onUpdate?.(object, updated.data);
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  function onSubmit(data: AvailabilityFormData) {
    if (instance) {
      updateAvailability(data);
    } else {
      createAvailability(data);
    }
  }

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!instance) {
      return;
    }
    AvailabilityModel.delete(instance.id)
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
      <div className="AvailabilityForm__confirmDelete">
        <p>
          Are you sure you want to delete this availability?
          <br />
          This action cannot be undone.
        </p>
        <div className="AvailabilityForm__confirmDelete__actions">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="red" onClick={clickConfirmDelete} variant="raised">
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="AvailabilityForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="AvailabilityForm__row">
        <div className="Input__container">
          <label className="text-capitalize">{contentType}</label>
          {contentType === 'client' && (
            <Badge size="sm">
              {object.first_name} {object.last_name}
            </Badge>
          )}
          {contentType === 'technician' && (
            <Badge
              size="sm"
              style={{
                backgroundColor: (object as Technician).bg_color,
                color: (object as Technician).text_color,
              }}
            >
              {object.first_name} {object.last_name}
            </Badge>
          )}
        </div>
      </div>
      <div className="AppointmentForm__row">
        <div className="Input__container">
          <label>Day</label>
          <p>{dayToString(day)}</p>
        </div>
      </div>
      <div className="AvailabilityForm__row">
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
                min={initialStartTime}
                max={initialEndTime}
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
                max={initialEndTime}
                onChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
              />
            );
          }}
        />
      </div>
      {contentType === 'client' && <Checkbox label="In clinic" {...form.register('in_clinic')} />}
      <div className="AvailabilityForm__actions">
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
