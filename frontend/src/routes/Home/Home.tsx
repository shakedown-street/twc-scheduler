import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AppointmentModel, BlockModel, ClientModel } from '~/api';
import { useAuth } from '~/features/auth/contexts/AuthContext';
import { Appointment } from '~/types/Appointment';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Button, Container, RadixDialog, RadixDialogProps, Select, TabItem, Tabs } from '~/ui';
import { formatTime } from '~/utils/format';
import './Home.scss';

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

export type TimeSlotTableProps = {
  day: number;
  clients: Client[];
  onClickBlockSlot: (args: { client: Client; block: Block }) => void;
};

export const TimeSlotTable = ({ day, clients, onClickBlockSlot }: TimeSlotTableProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const timeSlots = generateTimeSlots('08:00:00', '19:00:00', 15);

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
  }, []);

  function isSlotBlock(time: string) {
    return blocks.some((block) => time >= block.start_time && time < block.end_time);
  }

  function isSlotAvailable(time: string, availabilities: Availability[]) {
    return availabilities
      .filter((a) => a.day === day)
      .some((availability) => {
        const block = blocks.find((block) => block.id === availability.block);
        if (!block) {
          return false;
        }
        return time >= block?.start_time && time < block?.end_time;
      });
  }

  function isSlotAppointment(time: string, appointments: Appointment[]) {
    return appointments
      .filter((a) => a.day === day)
      .some((appointment) => time >= appointment.start_time && time < appointment.end_time);
  }

  function slotColor(time: string, client: Client) {
    if (isSlotAppointment(time, client.appointments || [])) {
      const appointment = client.appointments?.find(
        (appointment) => time >= appointment.start_time && time < appointment.end_time
      );
      return appointment?.technician_color || 'white';
    }
    if (isSlotAvailable(time, client.availabilities || [])) {
      return 'lightgray';
    }
    if (isSlotBlock(time)) {
      return 'white';
    }
    return 'gray';
  }

  function clickSlot(client: Client, time: string) {
    if (isSlotBlock(time)) {
      const block = blocks.find((block) => time >= block.start_time && time < block.end_time);
      if (!block) {
        return;
      }
      onClickBlockSlot?.({ client, block });
    }
  }

  return (
    <table className="TimeSlotTable">
      <thead>
        <tr>
          <th>Client</th>
          {timeSlots.map((slot) => (
            <th key={slot}>{formatTime(slot)}</th>
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
                style={{ backgroundColor: slotColor(slot, client), textAlign: 'center' }}
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
          <Button color="primary" type="submit" variant="raised">
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

  const { user } = useAuth();

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
        <div className="mt-12 text-center">
          <h1 className="mb-4">Welcome to Schedule Builder!</h1>
          {user && <p className="mb-4">{user.email}</p>}
          <p>
            <Link to="/style-guide">Click here</Link> to view the style guide
          </p>
        </div>

        <div>
          <ul>
            <li>
              <Link to="/client-availability">Client Availability</Link>
            </li>
            <li>
              <Link to="/tech-availability">Technician Availability</Link>
            </li>
          </ul>
        </div>

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
        />
      </Container>
      <CreateAppointment {...createAppointmentDialog} />
    </>
  );
};
