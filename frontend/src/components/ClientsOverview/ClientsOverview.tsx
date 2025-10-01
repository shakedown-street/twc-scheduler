import { useSchedule } from '@/contexts/ScheduleContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getBlockAppointments, getBlockAvailabilities } from '@/utils/appointments';
import { dayColor, skillLevelColor, striped } from '@/utils/color';
import { hours, hoursByDay, isMaxedOnSessions } from '@/utils/computedProperties';
import { Check, Info } from 'lucide-react';
import React from 'react';
import { AppointmentForm } from '../AppointmentForm/AppointmentForm';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { ClientForm } from '../ClientForm/ClientForm';
import { Button } from '../ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

const TableHeader = ({ children, className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th
      className={cn('border border-black p-1 text-left text-[10px] [writing-mode:vertical-rl]', className)}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td className={cn('border border-black p-1 text-left text-xs', className)} {...props}>
      {children}
    </td>
  );
};

export const ClientsOverview = () => {
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
  const { blocks, clients, setClients } = useSchedule();

  const days = [0, 1, 2, 3, 4];

  function totalHoursByDay(day: number) {
    return clients.reduce((acc, client) => acc + hoursByDay(client, day), 0);
  }

  function totalHours() {
    return clients.reduce((acc, client) => acc + hours(client), 0);
  }

  function displayTotalHoursByDay(client: Client, day: number) {
    return hoursByDay(client, day) > 0 ? hoursByDay(client, day) : '-';
  }

  function totalRequestedHours() {
    return clients.reduce((acc, client) => acc + client.prescribed_hours, 0);
  }

  function availableClientsCount(day: number, block: Block) {
    return clients.reduce((acc, client) => {
      const appointments = getBlockAppointments(client.appointments || [], day, block) || [];
      const availabilities = getBlockAvailabilities(client.availabilities || [], day, block) || [];
      return acc + (appointments.length < 1 && availabilities.length > 0 && !isMaxedOnSessions(client) ? 1 : 0);
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
        <TableCell
          className="relative cursor-pointer"
          onClick={() => {
            clickSlot(client, day, block);
          }}
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
          }}
        >
          {appointment.is_preschool_or_adaptive && (
            <div className="absolute top-0 right-0 bg-black p-0.5 text-[8px] leading-none text-white">PA</div>
          )}
        </TableCell>
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
      return (
        <TableCell
          key={block.id}
          className={cn('cursor-pointer bg-black text-center font-bold', {
            'text-red-500': isMaxedOnSessions(client),
            'text-green-500': !isMaxedOnSessions(client),
          })}
          onClick={() => {
            clickSlot(client, day, block);
          }}
          style={{
            borderLeftWidth,
            borderRightWidth,
          }}
        >
          {isMaxedOnSessions(client) ? 'M' : 'A'}
        </TableCell>
      );
    }

    // Render unavailable blocks
    return (
      <TableCell
        key={block.id}
        className="bg-neutral-700"
        style={{
          borderLeftWidth,
          borderRightWidth,
        }}
      ></TableCell>
    );
  }

  function renderLegend() {
    return (
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 border border-black bg-neutral-700"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center border border-black bg-black font-bold text-green-500">
            A
          </div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center border border-black bg-black font-bold text-red-500">
            M
          </div>
          <span>Maxed on sessions</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 border border-black" style={{ background: striped('black', 'white') }}></div>
          <span>In clinic</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-background relative h-6 w-6 border border-black">
            <div className="absolute top-0 right-0 bg-black p-0.5 text-[8px] leading-none font-bold text-white">PA</div>
          </div>
          <span>Preschool/adaptive</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button className="self-start" size="sm" variant="outline">
              <Info />
              Legend
            </Button>
          </HoverCardTrigger>
          <HoverCardContent align="start">{renderLegend()}</HoverCardContent>
        </HoverCard>
        <table className="w-full border-collapse">
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
              <TableHeader></TableHeader>
              <TableHeader title="Skill level requirement"></TableHeader>
              <TableHeader title="Spanish speaker">Spa</TableHeader>
              <TableHeader title="Client"></TableHeader>
              <TableHeader>Mon</TableHeader>
              <TableHeader>Tue</TableHeader>
              <TableHeader>Wed</TableHeader>
              <TableHeader>Thu</TableHeader>
              <TableHeader>Fri</TableHeader>
              <TableHeader title="Week hours">Week</TableHeader>
              <TableHeader title="Hours prescribed">Rx</TableHeader>
              <TableHeader title="Available"></TableHeader>
              {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <TableHeader
                      key={block.id}
                      className={cn('border-x text-black', {
                        'border-l-6': blockIndex === 0,
                        'border-r-6': blockIndex === blocks.length - 1,
                      })}
                      style={{
                        background: dayColor(dayIndex),
                      }}
                    >
                      {day}
                      {blockIndex + 1}
                    </TableHeader>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client.id} className="even:bg-muted hover:bg-border">
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell
                  className="text-center text-black"
                  style={{ background: skillLevelColor(client.req_skill_level) }}
                >
                  {client.req_skill_level}
                </TableCell>
                <TableCell className="text-center align-middle">
                  {client.req_spanish_speaking && <Check className="text-green-700" size="14" />}
                </TableCell>
                <TableCell className="text-nowrap">
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
                </TableCell>
                <TableCell className="text-center">{displayTotalHoursByDay(client, 0)}</TableCell>
                <TableCell className="text-center">{displayTotalHoursByDay(client, 1)}</TableCell>
                <TableCell className="text-center">{displayTotalHoursByDay(client, 2)}</TableCell>
                <TableCell className="text-center">{displayTotalHoursByDay(client, 3)}</TableCell>
                <TableCell className="text-center">{displayTotalHoursByDay(client, 4)}</TableCell>
                <TableCell className="text-center">{hours(client)}</TableCell>
                <TableCell className="text-center">{client.prescribed_hours}</TableCell>
                <TableCell
                  className={cn('bg-black text-center font-bold', {
                    'text-red-500': isMaxedOnSessions(client),
                    'text-green-500': !isMaxedOnSessions(client),
                  })}
                >
                  {isMaxedOnSessions(client) ? 'M' : 'A'}
                </TableCell>
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
            <tr className="hover:bg-border">
              <TableCell className="text-center" colSpan={4}>
                Total
              </TableCell>
              <TableCell className="text-center">{totalHoursByDay(0)}</TableCell>
              <TableCell className="text-center">{totalHoursByDay(1)}</TableCell>
              <TableCell className="text-center">{totalHoursByDay(2)}</TableCell>
              <TableCell className="text-center">{totalHoursByDay(3)}</TableCell>
              <TableCell className="text-center">{totalHoursByDay(4)}</TableCell>
              <TableCell className="text-center">{totalHours()}</TableCell>
              <TableCell className="text-center">{totalRequestedHours()}</TableCell>
              <TableCell></TableCell>
              {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <TableCell
                      key={block.id}
                      className={cn('border-x text-center', {
                        'border-l-6': blockIndex === 0,
                        'border-r-6': blockIndex === blocks.length - 1,
                      })}
                    >
                      {availableClientsCount(dayIndex, block)}
                    </TableCell>
                  ))}
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <TableCell colSpan={12}></TableCell>
              <TableCell colSpan={15} className="border-x-6">
                Total Available
              </TableCell>
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
