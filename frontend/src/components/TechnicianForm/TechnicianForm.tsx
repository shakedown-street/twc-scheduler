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
  bg_color: string;
  text_color: string;
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
      bg_color: technician?.bg_color ?? '',
      text_color: technician?.text_color ?? '',
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
      bg_color: technician.bg_color,
      text_color: technician.text_color,
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
        <Input fluid id="first_name" label="First Name" {...form.register('first_name', { required: true })} />
        <Input fluid id="last_name" label="Last Name" {...form.register('last_name', { required: true })} />
      </div>
      <div className="TechnicianForm__row">
        <Input
          fluid
          id="requested_hours"
          label="Requested Hours"
          type="number"
          {...form.register('requested_hours', { required: true })}
        />
        <Input
          fluid
          id="skill_level"
          label="Skill Level"
          min={1}
          max={3}
          type="number"
          {...form.register('skill_level', { required: true })}
        />
      </div>
      <div className="Input__container">
        <label htmlFor="color">Background Color</label>
        <input id="color" type="color" {...form.register('bg_color', { required: true })} />
      </div>
      <div className="Input__container">
        <label htmlFor="text_color">Font Color</label>
        <input id="text_color" type="color" {...form.register('text_color', { required: true })} />
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
        <Button color="primary" disabled={!form.formState.isValid} type="submit" variant="raised">
          Save
        </Button>
      </div>
    </form>
  );
};
