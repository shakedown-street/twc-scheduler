import React from 'react';
import { useForm } from 'react-hook-form';
import { AvailabilityModel, ClientModel, TechnicianModel } from '~/api';
import { Availability } from '~/types/Availability';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Checkbox, Input, RadixDialog, RadixDialogProps, Textarea, useToast } from '~/ui';
import './AvailabilityForm.scss';

export type AvailabilityFormProps = RadixDialogProps & {
  contentType: 'client' | 'technician';
  object?: Client | Technician; //
  day?: number; //
  initialStartTime?: string; //
  initialEndTime?: string; //
  instance?: Availability; //
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
  contentType,
  object,
  day,
  initialStartTime,
  initialEndTime,
  instance,
  onCreate,
  onUpdate,
  onDelete,
  ...rest
}: AvailabilityFormProps) => {
  const form = useForm<AvailabilityFormData>();
  const toast = useToast();

  React.useEffect(() => {
    if (rest.open) {
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
    }
  }, [rest.open]);

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
    <RadixDialog {...rest}>
      <div className="AvailabilityForm">
        <h3 className="mb-4">{instance ? 'Update' : 'Create'} Availability</h3>
        <form className="AvailabilityForm__form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="AvailabilityForm__form__row">
            <Input fluid label="Start time" type="time" {...form.register('start_time', { required: true })} />
            <Input fluid label="End time" type="time" {...form.register('end_time', { required: true })} />
          </div>
          {contentType === 'client' && <Checkbox label="In clinic" {...form.register('in_clinic')} />}
          <Textarea fluid label="Notes" {...form.register('notes')} />
          <div className="AvailabilityForm__form__actions">
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
      </div>
    </RadixDialog>
  );
};
