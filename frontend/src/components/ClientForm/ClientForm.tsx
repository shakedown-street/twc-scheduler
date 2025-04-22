import React from 'react';
import { useForm } from 'react-hook-form';
import { ClientModel, TechnicianModel } from '~/api';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Input, Select, Textarea, Toggle, useToast } from '~/ui';
import './ClientForm.scss';

export type ClientFormProps = {
  client?: Client;
  onCancel?: () => void;
  onCreate?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onUpdate?: (client: Client) => void;
};

export type ClientFormData = {
  first_name: string;
  last_name: string;
  eval_done: boolean;
  is_onboarding: boolean;
  prescribed_hours: number;
  req_skill_level: number;
  req_spanish_speaking: boolean;
  notes: string;
  past_technicians: string[];
};

export const ClientForm = ({ client, onCancel, onCreate, onDelete, onUpdate }: ClientFormProps) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);

  const form = useForm<ClientFormData>();
  const toast = useToast();

  React.useEffect(() => {
    if (!client) {
      return;
    }
    form.reset({
      first_name: client.first_name,
      last_name: client.last_name,
      eval_done: client.eval_done,
      is_onboarding: client.is_onboarding,
      prescribed_hours: client.prescribed_hours,
      req_skill_level: client.req_skill_level,
      req_spanish_speaking: client.req_spanish_speaking,
      notes: client.notes,
      past_technicians: client.past_technicians as string[],
    });
  }, [client, form.reset]);

  React.useEffect(() => {
    TechnicianModel.all({
      page_size: 1000,
    }).then((technicians) => {
      setTechnicians(technicians);
    });
  }, []);

  function clickDelete() {
    setConfirmDelete(true);
  }

  function clickConfirmDelete() {
    if (!client) {
      return;
    }
    ClientModel.delete(client.id)
      .then(() => {
        onDelete?.(client);
        setConfirmDelete(false);
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  function onSubmit(data: ClientFormData) {
    if (client) {
      ClientModel.update(client.id, data)
        .then((updated) => {
          onUpdate?.(updated.data);
        })
        .catch((err) => {
          toast.errorResponse(err);
        });
      return;
    }
    ClientModel.create(data)
      .then((created) => {
        onCreate?.(created.data);
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  if (confirmDelete) {
    return (
      <div className="ClientForm__confirmDelete">
        <p>
          Are you sure you want to delete {client?.first_name} {client?.last_name}?
          <br />
          This action cannot be undone.
        </p>
        <div className="ClientForm__confirmDelete__actions">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="red" onClick={clickConfirmDelete} variant="raised">
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="ClientForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="ClientForm__row">
        <Input fluid label="First Name" id="first_name" {...form.register('first_name', { required: true })} />
        <Input fluid label="Last Name" id="last_name" {...form.register('last_name', { required: true })} />
      </div>
      <div className="ClientForm__row">
        <Input
          fluid
          label="Prescribed Hours"
          type="number"
          {...form.register('prescribed_hours', { required: true })}
        />
        <Input
          fluid
          label="Required Skill Level"
          min={1}
          max={3}
          type="number"
          {...form.register('req_skill_level', { required: true })}
        />
      </div>
      <Toggle label="Require Spanish Speaking" {...form.register('req_spanish_speaking')} />
      <Toggle label="Evaluation Done" {...form.register('eval_done')} />
      <Toggle label="Currently Onboarding" {...form.register('is_onboarding')} />
      <Textarea rows={3} fluid label="Notes" style={{ resize: 'none' }} {...form.register('notes')} />
      {technicians.length > 0 && (
        <div>
          <Select
            className="ClientForm__pastTechnicians"
            label="Past Technicians"
            fluid
            multiple
            inputSize="xs"
            {...form.register('past_technicians')}
          >
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.first_name} {technician.last_name}
              </option>
            ))}
          </Select>
          <div className="hint mt-1">
            Technicians that have worked with this client in the past.
            <br />
            Hold down “Control”, or “Command” on a Mac, to select more than one.
          </div>
        </div>
      )}
      <div className="ClientForm__actions">
        {client && (
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
