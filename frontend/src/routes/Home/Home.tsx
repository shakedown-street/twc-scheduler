import React from 'react';
import { Helmet } from 'react-helmet';
import { ClientModel } from '~/api';
import { AppointmentForm } from '~/components/AppointmentForm/AppointmentForm';
import { TimeSlotTable } from '~/components/TimeSlotTable/TimeSlotTable';
import { Appointment } from '~/types/Appointment';
import { Client } from '~/types/Client';
import { Container, RadixDialog, TabItem, Tabs } from '~/ui';
import './Home.scss';

export const Home = () => {
  const [day, setDay] = React.useState(0);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [appointmentForm, setAppointmentForm] = React.useState<{
    open: boolean;
    instance?: Appointment;
    client?: Client;
    day: number;
    initialStartTime: string;
    initialEndTime: string;
    minTime: string;
    maxTime: string;
  }>({
    open: false,
    instance: undefined,
    client: undefined,
    day: 0,
    initialStartTime: '',
    initialEndTime: '',
    minTime: '',
    maxTime: '',
  });

  React.useEffect(() => {
    ClientModel.all({
      expand_appointments: true,
      expand_availabilities: true,
    }).then((clients) => {
      setClients(clients);
    });
  }, []);

  function openAppointmentForm(
    client: Client,
    day: number,
    startTime: string,
    endTime: string,
    minTime: string = startTime,
    maxTime: string = endTime,
    instance: Appointment | undefined = undefined
  ) {
    setAppointmentForm({
      ...appointmentForm,
      open: true,
      instance,
      client: client,
      day,
      initialStartTime: startTime,
      initialEndTime: endTime,
      minTime: minTime,
      maxTime: maxTime,
    });
  }

  function closeAppointmentForm() {
    setAppointmentForm({
      ...appointmentForm,
      open: false,
      instance: undefined,
      client: undefined,
      initialStartTime: '',
      initialEndTime: '',
      minTime: '',
      maxTime: '',
    });
  }

  function onCreateAppointment(created: Appointment[]) {
    const clientId = created[0].client?.id;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          c.appointments = [...(c.appointments || []), ...created];
          return c;
        }
        return c;
      })
    );
    closeAppointmentForm();
  }

  function onUpdateAppointment(updated: Appointment) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === updated.client?.id) {
          c.appointments = c.appointments?.map((a) => (a.id === updated.id ? updated : a));
          return c;
        }
        return c;
      })
    );
    closeAppointmentForm();
  }

  function onDeleteAppointment(deleted: Appointment) {
    setClients((prev) =>
      prev.map((c) => {
        c.appointments = c.appointments?.filter((a) => a.id !== deleted.id);
        return c;
      })
    );
    closeAppointmentForm();
  }

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
          onClickAvailabilitySlot={(client, availability, block) => {
            openAppointmentForm(client, day, availability.start_time, availability.end_time);
          }}
          onClickAppointmentSlot={(client, appointment, availability, block) => {
            openAppointmentForm(
              client,
              day,
              appointment.start_time,
              appointment.end_time,
              availability?.start_time || appointment.start_time,
              availability?.end_time || appointment.end_time,
              appointment
            );
          }}
        />
      </Container>
      <RadixDialog
        title={`${appointmentForm.instance ? 'Update' : 'Create'} Appointment`}
        open={appointmentForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeAppointmentForm();
          }
        }}
      >
        <div className="p-6">
          <h3 className="mb-4">{appointmentForm.instance ? 'Update' : 'Create'} Appointment</h3>
          {appointmentForm.client && (
            <AppointmentForm
              onCreate={(created) => onCreateAppointment(created)}
              onUpdate={(updated) => onUpdateAppointment(updated)}
              onDelete={(deleted) => onDeleteAppointment(deleted)}
              instance={appointmentForm.instance}
              client={appointmentForm.client}
              day={appointmentForm.day}
              initialStartTime={appointmentForm.initialStartTime}
              initialEndTime={appointmentForm.initialEndTime}
              minTime={appointmentForm.minTime}
              maxTime={appointmentForm.maxTime}
            />
          )}
        </div>
      </RadixDialog>
    </>
  );
};
