import React from 'react';
import { useForm } from 'react-hook-form';
import { TechnicianModel } from '~/api';
import { Technician } from '~/types/Technician';
import { Button, Input, Textarea, Toggle, useToast } from '~/ui';
import './TechnicianForm.scss';

export type TechnicianFormProps = {
  technician?: Technician;
  onCancel?: () => void;
  onCreate?: (technician: Technician) => void;
  onDelete?: (technician: Technician) => void;
  onUpdate?: (technician: Technician) => void;
};

export type TechnicianFormData = {
  first_name: string;
  last_name: string;
  color: string;
  requested_hours: number;
  skill_level: number;
  spanish_speaking: boolean;
  notes: string;
};

export const TechnicianForm = ({ technician, onCancel, onCreate, onDelete, onUpdate }: TechnicianFormProps) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<TechnicianFormData>({
    defaultValues: {
      first_name: technician?.first_name ?? '',
      last_name: technician?.last_name ?? '',
      color: technician?.color ?? '',
      requested_hours: technician?.requested_hours ?? 0,
      skill_level: technician?.skill_level ?? 1,
      spanish_speaking: technician?.spanish_speaking ?? false,
      notes: technician?.notes ?? '',
    },
  });
  const toast = useToast();

  React.useEffect(() => {
    if (!technician) {
      return;
    }
    form.reset({
      first_name: technician.first_name,
      last_name: technician.last_name,
      color: technician.color,
      requested_hours: technician.requested_hours,
      skill_level: technician.skill_level,
      spanish_speaking: technician.spanish_speaking,
      notes: technician.notes,
    });
  }, [technician, form.reset]);

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!technician) {
      return;
    }
    TechnicianModel.delete(technician.id)
      .then(() => {
        onDelete?.(technician);
        setConfirmDelete(false);
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  function onSubmit(data: TechnicianFormData) {
    if (technician) {
      TechnicianModel.update(technician.id, data)
        .then((updated) => {
          onUpdate?.(updated.data);
        })
        .catch((err) => {
          toast.errorResponse(err);
        });
      return;
    }
    TechnicianModel.create(data)
      .then((created) => {
        onCreate?.(created.data);
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  if (confirmDelete) {
    return (
      <div className="TechnicianForm__confirmDelete">
        <p>
          Are you sure you want to delete {technician?.first_name} {technician?.last_name}?
          <br />
          This action cannot be undone.
        </p>
        <div className="TechnicianForm__confirmDelete__actions">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="red" onClick={clickConfirmDelete} variant="raised">
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="TechnicianForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="TechnicianForm__row">
        <Input fluid id="first_name" label="First Name" {...form.register('first_name')} />
        <Input fluid id="last_name" label="Last Name" {...form.register('last_name')} />
      </div>
      <div className="TechnicianForm__row">
        <Input fluid id="requested_hours" label="Requested Hours" type="number" {...form.register('requested_hours')} />
        <Input
          fluid
          id="skill_level"
          label="Skill Level"
          min={1}
          max={3}
          type="number"
          {...form.register('skill_level')}
        />
      </div>
      <div className="Input__container">
        <label htmlFor="color">Color</label>
        <input id="color" type="color" {...form.register('color')} />
      </div>
      <Toggle label="Spanish Speaking" {...form.register('spanish_speaking')} />
      <Textarea rows={4} fluid label="Notes" style={{ resize: 'none' }} {...form.register('notes')} />
      <div className="TechnicianForm__actions">
        {technician && (
          <Button color="red" onClick={clickDelete}>
            Delete
          </Button>
        )}
        <div className="flex-1"></div>
        <Button onClick={() => onCancel?.()}>Cancel</Button>
        <Button color="primary" type="submit" variant="raised">
          Save
        </Button>
      </div>
    </form>
  );
};
