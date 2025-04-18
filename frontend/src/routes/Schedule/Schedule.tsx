import React from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { ClientModel } from '~/api';
import { AppointmentForm } from '~/components/AppointmentForm/AppointmentForm';
import { TimeSlotTable } from '~/components/TimeSlotTable/TimeSlotTable';
import { useBlocks } from '~/contexts/BlocksContext';
import { useAuth } from '~/features/auth/contexts/AuthContext';
import { Appointment } from '~/types/Appointment';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Container, RadixDialog, Spinner, TabItem, Tabs } from '~/ui';
import './Schedule.scss';

export const Schedule = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);
  const [appointmentForm, setAppointmentForm] = React.useState<{
    open: boolean;
    client?: Client;
    day: number;
    block?: Block;
    availability?: Availability;
    instance?: Appointment;
  }>({
    open: false,
    client: undefined,
    day: 0,
    block: undefined,
    availability: undefined,
    instance: undefined,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { blocks } = useBlocks();

  function getDay() {
    const day = searchParams.get('day');
    return day ? parseInt(day) : 0;
  }

  function setDay(day: number) {
    searchParams.set('day', `${day}`);
    setSearchParams(searchParams);
  }

  React.useEffect(() => {
    setClientsLoading(true);
    ClientModel.all({
      page_size: 1000,
      expand_appointments: true,
      expand_availabilities: true,
    })
      .then((clients) => {
        setClients(clients);
      })
      .finally(() => {
        setClientsLoading(false);
      });
  }, []);

  function openAppointmentForm(
    client: Client,
    day: number,
    block: Block,
    availability: Availability | undefined,
    instance: Appointment | undefined = undefined
  ) {
    if (!user?.is_superuser) {
      return;
    }
    setAppointmentForm({
      ...appointmentForm,
      open: true,
      client: client,
      day,
      block,
      availability,
      instance,
    });
  }

  function closeAppointmentForm() {
    setAppointmentForm({
      ...appointmentForm,
      open: false,
      client: undefined,
      block: undefined,
      availability: undefined,
      instance: undefined,
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

  if (clientsLoading) {
    return <Spinner className="mt-8" message="Loading schedule..." />;
  }

  return (
    <>
      <Helmet>
        <title>Schedule | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="mt-4 mb-12">
          <h1>Schedule</h1>
          <Tabs className="mb-4">
            <TabItem active={getDay() === 0} onClick={() => setDay(0)}>
              Monday
            </TabItem>
            <TabItem active={getDay() === 1} onClick={() => setDay(1)}>
              Tuesday
            </TabItem>
            <TabItem active={getDay() === 2} onClick={() => setDay(2)}>
              Wednesday
            </TabItem>
            <TabItem active={getDay() === 3} onClick={() => setDay(3)}>
              Thursday
            </TabItem>
            <TabItem active={getDay() === 4} onClick={() => setDay(4)}>
              Friday
            </TabItem>
          </Tabs>
          <TimeSlotTable
            blocks={blocks}
            clients={clients}
            day={getDay()}
            onClickAvailabilitySlot={(client, block, availability) => {
              openAppointmentForm(client, getDay(), block, availability);
            }}
            onClickAppointmentSlot={(client, block, appointment, availability) => {
              openAppointmentForm(client, getDay(), block, availability, appointment);
            }}
          />
        </div>
      </Container>
      <RadixDialog
        asDrawer
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
          {appointmentForm.client && appointmentForm.block && (
            <AppointmentForm
              onCreate={(created) => onCreateAppointment(created)}
              onUpdate={(updated) => onUpdateAppointment(updated)}
              onDelete={(deleted) => onDeleteAppointment(deleted)}
              client={appointmentForm.client}
              day={appointmentForm.day}
              block={appointmentForm.block}
              availability={appointmentForm.availability}
              instance={appointmentForm.instance}
            />
          )}
        </div>
      </RadixDialog>
    </>
  );
};
