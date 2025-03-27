import React from 'react';
import { AppointmentModel, ClientModel } from '~/api';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, RadixDialog, RadixDialogProps, Select } from '~/ui';

export type CreateAppointmentProps = RadixDialogProps & {
  client?: Client;
  day?: number;
  block?: Block;
  onSuccess?: () => void;
};

export const CreateAppointment = ({ client, day, block, onSuccess, ...rest }: CreateAppointmentProps) => {
  const [availableTechnicians, setAvailableTechnicians] = React.useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = React.useState('');

  React.useEffect(() => {
    if (!client || !block) {
      return;
    }
    setSelectedTechnicianId('');
    ClientModel.detailAction(
      client.id,
      'available_techs',
      'get',
      {},
      {
        day: day,
        block: block.id,
      }
    ).then((technicians) => {
      setAvailableTechnicians(technicians.data as Technician[]);
    });
  }, [client, day, block]);

  function createAppointment() {
    if (!client || !block || !selectedTechnicianId) {
      return;
    }
    AppointmentModel.create({
      client: client.id,
      technician: selectedTechnicianId,
      day: day,
      start_time: block.start_time,
      end_time: block.end_time,
    }).then(() => {
      onSuccess?.();
    });
  }

  return (
    <RadixDialog {...rest}>
      <form
        className="p-6"
        onSubmit={(e) => {
          e.preventDefault();
          createAppointment();
        }}
      >
        <h3 className="mb-4">Create Appointment</h3>
        <Select
          fluid
          onChange={(e) => {
            setSelectedTechnicianId(e.target.value);
          }}
          value={selectedTechnicianId}
        >
          <option value="">Select a technician</option>
          {availableTechnicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.first_name} {technician.last_name}
            </option>
          ))}
        </Select>
        <div className="mt-4 flex justify-end">
          <Button color="primary" disabled={!selectedTechnicianId} type="submit" variant="raised">
            Create Appointment
          </Button>
        </div>
      </form>
    </RadixDialog>
  );
};
