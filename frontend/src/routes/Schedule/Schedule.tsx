import { ClientModel } from '@/api';
import { AppointmentForm } from '@/components/AppointmentForm/AppointmentForm';
import { ClientForm } from '@/components/ClientForm/ClientForm';
import { TechnicianDayOverview } from '@/components/TechnicianDayOverview/TechnicianDayOverview';
import { TherapyAppointmentForm } from '@/components/TherapyAppointmentForm/TherapyAppointmentForm';
import { TimeSlotTable } from '@/components/TimeSlotTable/TimeSlotTable';
import { useBlocks } from '@/contexts/BlocksContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Button, Container, RadixDialog, Spinner, TabItem, Tabs } from '@/ui';
import { orderByFirstName } from '@/utils/order';
import { dayToString } from '@/utils/time';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import './Schedule.scss';

export const Schedule = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);
  const [technicianDayOverviewOpen, setTechnicianDayOverviewOpen] = React.useState(false);
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
  const [therapyAppointmentForm, setTherapyAppointmentForm] = React.useState<{
    open: boolean;
    client?: Client;
    day: number;
    initialStartTime: string;
    instance?: TherapyAppointment;
  }>({
    open: false,
    client: undefined,
    day: 0,
    initialStartTime: '09:00:00',
    instance: undefined,
  });
  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
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

    const fetchClients = () => {
      ClientModel.all({
        page_size: 1000,
        expand_appointments: true,
        expand_availabilities: true,
        expand_properties: true,
      })
        .then((clients) => {
          setClients(orderByFirstName<Client>(clients));
        })
        .finally(() => {
          setClientsLoading(false);
        });
    };

    // Poll every minute
    const pollInterval = setInterval(() => {
      fetchClients();
    }, 60 * 1000);

    // Initial fetch
    fetchClients();

    return () => clearInterval(pollInterval);
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

  function openTherapyAppointmentForm(
    client: Client,
    day: number,
    initialStartTime: string,
    instance: TherapyAppointment | undefined = undefined
  ) {
    if (!user?.is_superuser) {
      return;
    }
    setTherapyAppointmentForm({
      ...therapyAppointmentForm,
      open: true,
      client: client,
      day,
      initialStartTime,
      instance,
    });
  }

  function closeTherapyAppointmentForm() {
    setTherapyAppointmentForm({
      ...therapyAppointmentForm,
      open: false,
      client: undefined,
      day: 0,
      initialStartTime: '09:00:00',
      instance: undefined,
    });
  }

  function onCreateTherapyAppointment(created: TherapyAppointment) {
    const clientId = created.client;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          c.therapy_appointments = [...(c.therapy_appointments || []), created];
          return c;
        }
        return c;
      })
    );
    closeTherapyAppointmentForm();
  }

  function onUpdateTherapyAppointment(updated: TherapyAppointment) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === updated.client) {
          c.therapy_appointments = c.therapy_appointments?.map((a) => (a.id === updated.id ? updated : a));
          return c;
        }
        return c;
      })
    );
    closeTherapyAppointmentForm();
  }

  function onDeleteTherapyAppointment(deleted: TherapyAppointment) {
    setClients((prev) =>
      prev.map((c) => {
        c.therapy_appointments = c.therapy_appointments?.filter((a) => a.id !== deleted.id);
        return c;
      })
    );
    closeTherapyAppointmentForm();
  }

  function openClientForm(client: Client | undefined = undefined) {
    setClientForm({
      ...clientForm,
      open: true,
      client,
    });
  }

  function closeClientForm() {
    setClientForm({
      ...clientForm,
      open: false,
      client: undefined,
    });
  }

  function onUpdateClient(updated: Client) {
    setClients(clients.map((c) => (c.id === updated.id ? Object.assign({}, c, updated) : c)));
    closeClientForm();
  }

  function onDeleteClient(deleted: Client) {
    setClients(clients.filter((c) => c.id !== deleted.id));
    closeClientForm();
  }

  if (clientsLoading) {
    return <Spinner className="mt-8" message="Loading clients..." />;
  }

  return (
    <>
      <Helmet>
        <title>Schedule | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="mt-4 mb-12">
          <h1>Schedule</h1>
          <div className="Schedule__header">
            <Tabs>
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
            <Button color="primary" onClick={() => setTechnicianDayOverviewOpen(true)} variant="ghost">
              {dayToString(getDay())} Technician Overview
            </Button>
          </div>
          <p className="mb-4 text-size-xs text-color-muted">
            <b>NOTE</b>: Click any time slot while holding the "Shift" key to add/remove OT, ST, and MH appointments
          </p>
          <TimeSlotTable
            blocks={blocks}
            clients={clients}
            day={getDay()}
            onClickClient={(client) => {
              if (!user?.is_superuser) {
                return;
              }
              openClientForm(client);
            }}
            onClickAvailabilitySlot={(client, block, availability) => {
              openAppointmentForm(client, getDay(), block, availability);
            }}
            onClickAppointmentSlot={(client, block, appointment, availability) => {
              openAppointmentForm(client, getDay(), block, availability, appointment);
            }}
            onShiftClick={(client, time, therapyAppointment) => {
              openTherapyAppointmentForm(client, getDay(), time, therapyAppointment);
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
      <RadixDialog
        asDrawer
        title={`${therapyAppointmentForm.instance ? 'Update' : 'Create'} Therapy Appointment`}
        open={therapyAppointmentForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeTherapyAppointmentForm();
          }
        }}
      >
        <div className="p-6">
          <h3 className="mb-4">{therapyAppointmentForm.instance ? 'Update' : 'Create'} Therapy Appointment</h3>
          {therapyAppointmentForm.client && (
            <TherapyAppointmentForm
              onCreate={(created) => onCreateTherapyAppointment(created)}
              onUpdate={(updated) => onUpdateTherapyAppointment(updated)}
              onDelete={(deleted) => onDeleteTherapyAppointment(deleted)}
              client={therapyAppointmentForm.client}
              day={therapyAppointmentForm.day}
              initialStartTime={therapyAppointmentForm.initialStartTime}
              instance={therapyAppointmentForm.instance}
            />
          )}
        </div>
      </RadixDialog>
      {clientForm.client && (
        <RadixDialog
          asDrawer
          title={`Update Client`}
          open={clientForm.open}
          onOpenChange={(open) => setClientForm({ ...clientForm, open, client: undefined })}
        >
          <div className="p-6">
            <h3 className="mb-4">Update Client</h3>
            <ClientForm
              client={clientForm.client}
              onCancel={() => {
                setClientForm({ ...clientForm, open: false, client: undefined });
              }}
              onDelete={onDeleteClient}
              onUpdate={onUpdateClient}
            />
          </div>
        </RadixDialog>
      )}
      <RadixDialog
        asDrawer
        title="Technician Day Overview"
        open={technicianDayOverviewOpen}
        onOpenChange={(open) => {
          setTechnicianDayOverviewOpen(open);
        }}
      >
        <div className="p-6">
          <h3 className="mb-4">Technician Overview for {dayToString(getDay())}</h3>
          <TechnicianDayOverview day={getDay()} />
        </div>
      </RadixDialog>
    </>
  );
};
