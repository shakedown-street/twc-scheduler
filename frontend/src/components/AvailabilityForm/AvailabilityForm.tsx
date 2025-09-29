import { AvailabilityModel, ClientModel, TechnicianModel } from '@/api';
import { toastError } from '@/utils/errors';
import { dayToString } from '@/utils/time';
import { Info } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TimeInput } from '../TimeInput/TimeInput';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type AvailabilityFormProps = {
  instance?: Availability;
  contentType: 'client' | 'technician';
  object: Client | Technician;
  day: number;
  initialStartTime: string;
  initialEndTime: string;
  onCreate?: (object: Client | Technician, created: Availability) => void;
  onUpdate?: (object: Client | Technician, updated: Availability) => void;
  onDelete?: (object: Client | Technician, deleted: Availability) => void;
};

export type AvailabilityFormData = {
  start_time: string;
  end_time: string;
  in_clinic?: boolean;
  is_sub?: boolean;
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

  React.useEffect(() => {
    if (instance) {
      form.reset({
        start_time: instance.start_time,
        end_time: instance.end_time,
        in_clinic: instance.in_clinic,
        is_sub: instance.is_sub,
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
        toastError(err);
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
        toastError(err);
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
        onDelete?.(object, instance);
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
          Are you sure you want to delete this availability?
          <br />
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-between gap-4">
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
        <Label className="capitalize">{contentType}</Label>
        {contentType === 'client' && (
          <Badge>
            {object.first_name} {object.last_name}
          </Badge>
        )}
        {contentType === 'technician' && (
          <Badge
            style={{
              background: (object as Technician).bg_color,
              color: (object as Technician).text_color,
            }}
          >
            {object.first_name} {object.last_name}
          </Badge>
        )}
      </div>
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
                  min={initialStartTime}
                  max={initialEndTime}
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
                  max={initialEndTime}
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
      {contentType === 'client' && (
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
        </div>
      )}
      {contentType === 'technician' && (
        <div className="form-group">
          <div className="flex items-center gap-2">
            <Controller
              control={form.control}
              name="is_sub"
              render={({ field }) => (
                <Checkbox checked={field.value} id="is_sub" onCheckedChange={() => field.onChange(!field.value)} />
              )}
            />
            <Label htmlFor="is_sub">
              As sub only
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size="16" />
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  Check this box to indicate that this technician is only available to sub for other technicians during
                  this time, and not for their own appointments.
                </TooltipContent>
              </Tooltip>
            </Label>
          </div>
        </div>
      )}
      <div className="flex justify-end">
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
