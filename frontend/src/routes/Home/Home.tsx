import React from 'react';
import { Helmet } from 'react-helmet';
import { AppointmentModel, BlockModel, ClientModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Container, RadixDialog, RadixDialogProps, Select, TabItem, Tabs } from '~/ui';
import { formatTimeTimeline, isBetweenInclusiveStart, isOnTheHour } from '~/utils/time';
import './Home.scss';

export type TimeSlotTableProps = {
  clients: Client[];
  day: number;
  onClickBlockSlot: (args: { client: Client; block: Block }) => void;
  onDeleteAppointment?: (appointment: Appointment) => void;
};

export const TimeSlotTable = ({ clients, day, onClickBlockSlot, onDeleteAppointment }: TimeSlotTableProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [timeSlots, setTimeSlots] = React.useState<string[]>([]);

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
      setTimeSlots(generateTimeSlots(blocks[0].start_time, blocks[blocks.length - 1].end_time, 15));
    });
  }, []);

  function generateTimeSlots(startTime: string, endTime: string, interval: number) {
    const timeSlots: string[] = [];
    let currentTime = startTime;
    while (currentTime < endTime) {
      timeSlots.push(currentTime);
      let [hours, minutes, seconds] = currentTime.split(':').map(Number);
      minutes += interval;
      if (minutes >= 60) {
        hours += 1;
        minutes -= 60;
      }
      currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0'
      )}`;
    }
    return timeSlots;
  }

  function isSlotBlock(time: string) {
    return blocks.some((block) => {
      return isBetweenInclusiveStart(time, block.start_time, block.end_time);
    });
  }

  function isSlotAvailable(time: string, client: Client) {
    return client.availabilities
      ?.filter((a) => a.day === day)
      .some((availability) => {
        const block = blocks.find((block) => block.id === availability.block);
        if (!block) {
          return false;
        }
        return isBetweenInclusiveStart(time, block.start_time, block.end_time);
      });
  }

  function isSlotAppointment(time: string, appointments: Appointment[]) {
    return appointments
      .filter((a) => a.day === day)
      .some((appointment) => {
        return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
      });
  }

  function slotColor(time: string, client: Client) {
    if (isSlotAppointment(time, client.appointments || [])) {
      const appointment = client.appointments
        ?.filter((a) => a.day === day)
        .find((appointment) => {
          return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
        });
      return appointment?.technician_color || 'white';
    }
    if (isSlotAvailable(time, client)) {
      return 'lightgray';
    }
    if (isSlotBlock(time)) {
      return 'white';
    }
    return 'gray';
  }

  function clickSlot(client: Client, time: string) {
    if (isSlotAppointment(time, client.appointments || [])) {
      const appointment = client.appointments
        ?.filter((a) => a.day === day)
        .find((appointment) => {
          return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
        });
      if (!appointment) {
        return;
      }

      onDeleteAppointment?.(appointment);
      return;
    }
    if (isSlotBlock(time)) {
      const block = blocks.find((block) => isBetweenInclusiveStart(time, block.start_time, block.end_time));
      if (!block) {
        return;
      }
      onClickBlockSlot?.({ client, block });
      return;
    }
  }

  return (
    <table className="TimeSlotTable">
      <thead>
        <tr>
          <th>Client</th>
          {timeSlots.map((slot) => (
            <th
              key={slot}
              style={{
                borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                backgroundColor: isSlotBlock(slot) ? 'white' : 'gray',
                fontWeight: isOnTheHour(slot) ? 'bold' : 'light',
              }}
            >
              {formatTimeTimeline(slot)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>
              {client.first_name} {client.last_name}
            </td>
            {timeSlots.map((slot) => (
              <td
                key={slot}
                className="TimeSlotTable__slot"
                style={{
                  borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                  backgroundColor: slotColor(slot, client),
                }}
                onClick={() => {
                  clickSlot(client, slot);
                }}
              ></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

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

export const Home = () => {
  const [day, setDay] = React.useState(0);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [createAppointmentDialog, setCreateAppointmentDialog] = React.useState<CreateAppointmentProps>({
    client: undefined,
    day: 0,
    block: undefined,
    open: false,
    onOpenChange: (open: boolean) => {
      setCreateAppointmentDialog((prev) => ({ ...prev, open }));
    },
    onSuccess: () => {
      ClientModel.all({
        expand_appointments: true,
        expand_availabilities: true,
      }).then((clients) => {
        setClients(clients);
      });
      setCreateAppointmentDialog((prev) => ({ ...prev, open: false }));
    },
    title: 'Create Appointment',
  });

  React.useEffect(() => {
    ClientModel.all({
      expand_appointments: true,
      expand_availabilities: true,
    }).then((clients) => {
      setClients(clients);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Home | Schedule Builder</title>
      </Helmet>
      <Container>
        <Tabs className="my-4">
          <TabItem active={day === 0} onClick={() => setDay(0)}>
            Monday
          </TabItem>
          <TabItem active={day === 1} onClick={() => setDay(1)}>
            Tuesday
          </TabItem>
          <TabItem active={day === 2} onClick={() => setDay(2)}>
            Wednesday
          </TabItem>
          <TabItem active={day === 3} onClick={() => setDay(3)}>
            Thursday
          </TabItem>
          <TabItem active={day === 4} onClick={() => setDay(4)}>
            Friday
          </TabItem>
        </Tabs>

        <TimeSlotTable
          clients={clients}
          day={day}
          onClickBlockSlot={({ client, block }) =>
            setCreateAppointmentDialog({
              ...createAppointmentDialog,
              open: true,
              client,
              day,
              block,
            })
          }
          onDeleteAppointment={(appointment) => {
            AppointmentModel.delete(appointment.id).then(() => {
              ClientModel.all({
                expand_appointments: true,
                expand_availabilities: true,
              }).then((clients) => {
                setClients(clients);
              });
            });
          }}
        />
      </Container>
      <CreateAppointment {...createAppointmentDialog} />
    </>
  );
};
