import { ClientModel } from '@/api';
import { useBlocks } from '@/contexts/BlocksContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { getBlockAppointments, getBlockAvailabilities } from '@/utils/appointments';
import { dayColor, skillLevelColor, striped } from '@/utils/color';
import { orderByFirstName } from '@/utils/order';
import { Check, Info, Loader } from 'lucide-react';
import React from 'react';
import { AppointmentForm } from '../AppointmentForm/AppointmentForm';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { ClientForm } from '../ClientForm/ClientForm';
import { Button } from '../ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import './ClientsOverview.scss';

export const ClientsOverview = () => {
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
  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
  });

  const { user } = useAuth();
  const { blocks } = useBlocks();

  const days = [0, 1, 2, 3, 4];

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

  function totalHoursByDay(day: number) {
    return clients.reduce(
      (acc, client) => acc + (client.computed_properties ? client.computed_properties.total_hours_by_day[day] : 0),
      0,
    );
  }

  function totalHours() {
    return clients.reduce(
      (acc, client) => acc + (client.computed_properties ? client.computed_properties.total_hours : 0),
      0,
    );
  }

  function displayTotalHoursByDay(client: Client, day: number) {
    return client.computed_properties!.total_hours_by_day[day] > 0
      ? client.computed_properties!.total_hours_by_day[day]
      : '-';
  }

  function totalRequestedHours() {
    return clients.reduce((acc, client) => acc + client.prescribed_hours, 0);
  }

  function availableClientsCount(day: number, block: Block) {
    return clients.reduce((acc, client) => {
      const appointments = getBlockAppointments(client.appointments || [], day, block) || [];
      const availabilities = getBlockAvailabilities(client.availabilities || [], day, block) || [];
      return (
        acc +
        (appointments.length < 1 && availabilities.length > 0 && !client.computed_properties?.is_maxed_on_sessions
          ? 1
          : 0)
      );
    }, 0);
  }

  function openAppointmentForm(
    client: Client,
    day: number,
    block: Block,
    availability: Availability | undefined,
    instance: Appointment | undefined = undefined,
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
      }),
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
      }),
    );
    closeAppointmentForm();
  }

  function onDeleteAppointment(deleted: Appointment) {
    setClients((prev) =>
      prev.map((c) => {
        c.appointments = c.appointments?.filter((a) => a.id !== deleted.id);
        return c;
      }),
    );
    closeAppointmentForm();
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

  function clickSlot(client: Client, day: number, block: Block) {
    const blockAppointments = getBlockAppointments(client.appointments || [], day, block) || [];
    const blockAvailabilities = getBlockAvailabilities(client.availabilities || [], day, block) || [];

    if (blockAppointments) {
      openAppointmentForm(client, day, block, blockAvailabilities[0], blockAppointments[0]);
      return;
    }
    if (blockAvailabilities) {
      openAppointmentForm(client, day, block, blockAvailabilities[0]);
      return;
    }
  }

  function renderBlock(client: Client, day: number, block: Block, blockIndex: number) {
    const blockAppointments = getBlockAppointments(client.appointments || [], day, block) || [];
    const blockAvailabilities = getBlockAvailabilities(client.availabilities || [], day, block) || [];

    const borderLeftWidth = blockIndex === 0 ? '6px' : '1px';
    const borderRightWidth = blockIndex === blocks.length - 1 ? '6px' : '1px';

    // Render appointment blocks
    if (blockAppointments.length > 0) {
      const appointment = blockAppointments[0];
      let background = appointment.technician?.bg_color || 'var(--background)';
      if (appointment.in_clinic) {
        const bgColor = appointment.technician?.bg_color || 'var(--background)';
        const textColor = appointment.technician?.text_color || 'var(--foreground)';
        background = striped(textColor, bgColor);
      }

      const hoverTrigger = (
        <td
          className="ClientsOverview__slot"
          onClick={() => {
            clickSlot(client, day, block);
          }}
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
            cursor: 'pointer',
          }}
        >
          {appointment.is_preschool_or_adaptive && <div className="ClientsOverview__slot__corner">PA</div>}
        </td>
      );

      if (user?.hover_cards_enabled) {
        return (
          <HoverCard key={block.id}>
            <HoverCardTrigger asChild>{hoverTrigger}</HoverCardTrigger>
            <HoverCardContent className="w-96">
              <AppointmentHover appointment={appointment} />
            </HoverCardContent>
          </HoverCard>
        );
      } else {
        return hoverTrigger;
      }
    }

    // Render availability blocks
    if (blockAvailabilities.length > 0) {
      let background = 'black';
      if (client.computed_properties?.is_maxed_on_sessions) {
        background = 'black';
      }
      return (
        <td
          key={block.id}
          onClick={() => {
            clickSlot(client, day, block);
          }}
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
            color: client.computed_properties?.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
            cursor: 'pointer',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {client.computed_properties?.is_maxed_on_sessions ? 'M' : 'A'}
        </td>
      );
    }

    // Render unavailable blocks
    return (
      <td
        key={block.id}
        style={{
          background: '#404040', // tw-neutral-700
          borderLeftWidth,
          borderRightWidth,
        }}
      ></td>
    );
  }

  function renderLegend() {
    return (
      <div className="ClientsOverview__legend">
        <div className="ClientsOverview__legend__example">
          <div className="ClientsOverview__legend__example__color bg-neutral-700"></div>
          <span>Unavailable</span>
        </div>
        <div className="ClientsOverview__legend__example">
          <div className="ClientsOverview__legend__example__color bg-black text-green-500">A</div>
          <span>Available</span>
        </div>
        <div className="ClientsOverview__legend__example">
          <div className="ClientsOverview__legend__example__color bg-black text-red-500">M</div>
          <span>Maxed on sessions</span>
        </div>
        <div className="ClientsOverview__legend__example">
          <div
            className="ClientsOverview__legend__example__color"
            style={{ background: striped('black', 'white') }}
          ></div>
          <span>In clinic</span>
        </div>
        <div className="ClientsOverview__legend__example">
          <div className="ClientsOverview__legend__example__color bg-background">
            <div className="ClientsOverview__legend__example__color__corner">PA</div>
          </div>
          <span>Preschool/adaptive</span>
        </div>
      </div>
    );
  }

  if (clientsLoading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button className="self-start" size="sm" variant="outline">
              <Info />
              Legend
            </Button>
          </HoverCardTrigger>
          <HoverCardContent align="start">{renderLegend()}</HoverCardContent>
        </HoverCard>
        <table className="ClientsOverview">
          <colgroup>
            <col width="24px" />
            <col width="24px" />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col width="24px" />
            {['M', 'T', 'W', 'TH', 'F'].map((day) => (
              <React.Fragment key={day}>
                {blocks.map((block) => (
                  <col key={block.id} width="28px" />
                ))}
              </React.Fragment>
            ))}
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th title="Skill level requirement"></th>
              <th title="Spanish speaker">Spa</th>
              <th title="Client"></th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th title="Week hours">Week</th>
              <th title="Hours prescribed">Rx</th>
              <th title="Available"></th>
              {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <th
                      key={block.id}
                      style={{
                        background: dayColor(dayIndex),
                        borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                        borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                        color: 'black',
                      }}
                    >
                      {day}
                      {blockIndex + 1}
                    </th>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client.id}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td
                  style={{ background: skillLevelColor(client.req_skill_level), color: 'black', textAlign: 'center' }}
                >
                  {client.req_skill_level}
                </td>
                <td
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  {client.req_spanish_speaking && <Check className="text-green-700" size="14" />}
                </td>
                <td className="text-nowrap">
                  <a
                    className="text-primary cursor-pointer"
                    onClick={() => {
                      if (!user?.is_superuser) {
                        return;
                      }
                      openClientForm(client);
                    }}
                  >
                    {client.first_name} {client.last_name}
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(client, 0)}</td>
                <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(client, 1)}</td>
                <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(client, 2)}</td>
                <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(client, 3)}</td>
                <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(client, 4)}</td>
                <td style={{ textAlign: 'center' }}>{client.computed_properties!.total_hours}</td>
                <td style={{ textAlign: 'center' }}>{client.prescribed_hours}</td>
                <td
                  style={{
                    background: 'black',
                    color: client.computed_properties?.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {client.computed_properties?.is_maxed_on_sessions ? 'M' : 'A'}
                </td>
                {days.map((day) => (
                  <React.Fragment key={day}>
                    {blocks.map((block, blockIndex) => (
                      <React.Fragment key={block.id}>{renderBlock(client, day, block, blockIndex)}</React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                Total
              </td>
              <td style={{ textAlign: 'center' }}>{totalHoursByDay(0)}</td>
              <td style={{ textAlign: 'center' }}>{totalHoursByDay(1)}</td>
              <td style={{ textAlign: 'center' }}>{totalHoursByDay(2)}</td>
              <td style={{ textAlign: 'center' }}>{totalHoursByDay(3)}</td>
              <td style={{ textAlign: 'center' }}>{totalHoursByDay(4)}</td>
              <td style={{ textAlign: 'center' }}>{totalHours()}</td>
              <td style={{ textAlign: 'center' }}>{totalRequestedHours()}</td>
              <td></td>
              {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <td
                      key={block.id}
                      style={{
                        borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                        borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                        textAlign: 'center',
                      }}
                    >
                      {availableClientsCount(dayIndex, block)}
                    </td>
                  ))}
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td colSpan={12}></td>
              <td
                colSpan={15}
                style={{
                  borderLeftWidth: '6px',
                  borderRightWidth: '6px',
                }}
              >
                Total Available
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Sheet
        open={appointmentForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeAppointmentForm();
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{appointmentForm.instance ? 'Update' : 'Create'} Appointment</SheetTitle>
          </SheetHeader>
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
        </SheetContent>
      </Sheet>
      {clientForm.client && (
        <Sheet
          open={clientForm.open}
          onOpenChange={(open) => setClientForm({ ...clientForm, open, client: undefined })}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Update Client</SheetTitle>
            </SheetHeader>
            <ClientForm
              client={clientForm.client}
              onCancel={() => {
                setClientForm({ ...clientForm, open: false, client: undefined });
              }}
              onDelete={onDeleteClient}
              onUpdate={onUpdateClient}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
