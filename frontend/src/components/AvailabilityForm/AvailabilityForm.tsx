import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AvailabilityModel, ClientModel, TechnicianModel } from '~/api';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Checkbox, Textarea, TimeInput, useToast } from '~/ui';
import './AvailabilityForm.scss';

export type AvailabilityFormProps = {
  instance?: Availability;
  contentType: 'client' | 'technician';
  object: Client | Technician;
  day: number;
  block: Block;
  onCreate?: (object: Client | Technician, created: Availability) => void;
  onUpdate?: (object: Client | Technician, updated: Availability) => void;
  onDelete?: (deleted: Availability) => void;
};

export type AvailabilityFormData = {
  start_time: string;
  end_time: string;
  notes?: string;
  in_clinic?: boolean;
};

export const AvailabilityForm = ({
  instance,
  contentType,
  object,
  day,
  block,
  onCreate,
  onUpdate,
  onDelete,
}: AvailabilityFormProps) => {
  const form = useForm<AvailabilityFormData>();
  const toast = useToast();

  React.useEffect(() => {
    if (instance) {
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
        notes: instance.notes,
        in_clinic: instance.in_clinic,
      });
    } else if (block) {
      form.reset({
        start_time: block.start_time,
        end_time: block.end_time,
      });
    }
  }, [instance, block]);

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

  function deleteAvailability() {
    if (!object || !instance) {
      return;
    }
    AvailabilityModel.delete(instance.id)
      .then(() => {
        onDelete?.(instance);
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

  return (
    <form className="AvailabilityForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="AvailabilityForm__row">
        <Controller
          control={form.control}
          name="start_time"
          render={({ field }) => {
            return (
              <TimeInput
                inputProps={{
                  fluid: true,
                  label: 'Start time',
                }}
                min={block.start_time}
                max={block.end_time}
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
                  label: 'End time',
                }}
                min={block.start_time}
                max={block.end_time}
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
      <Textarea fluid label="Notes" {...form.register('notes')} />
      <div className="AvailabilityForm__actions">
        {instance && (
          <Button
            color="red"
            onClick={() => {
              deleteAvailability();
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
