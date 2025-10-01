import { useSchedule } from '@/contexts/ScheduleContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import React from 'react';
import { ClientForm } from '../ClientForm/ClientForm';
import { TechnicianForm } from '../TechnicianForm/TechnicianForm';
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
    <td className={cn('border border-black p-1 text-center text-xs', className)} {...props}>
      {children}
    </td>
  );
};

export const ClientTechnicianMatrix = () => {
  const [hoveredColumn, setHoveredColumn] = React.useState<number>();

  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
  });
  const [technicianForm, setTechnicianForm] = React.useState<{
    open: boolean;
    technician?: Technician;
  }>({
    open: false,
    technician: undefined,
  });

  const { user } = useAuth();
  const { clients, setClients, technicians, setTechnicians } = useSchedule();

  function countAppointments(client: Client, technician: Technician) {
    if (!client.appointments) {
      return 0;
    }

    const appointments = client.appointments.filter((appointment) => appointment.technician?.id === technician.id);
    return appointments.length;
  }

  function totalTechs(client: Client) {
    if (!client.appointments) {
      return 0;
    }

    const techs = new Set(client.appointments.map((appointment) => appointment.technician?.id));
    return techs.size;
  }

  function getTotalTechsColor(techs: number) {
    if (techs >= 5) {
      return '#fecaca'; // tw-red-200
    } else if (techs === 4) {
      return '#fef08a'; // tw-yellow-200
    } else if (techs > 0 && techs < 4) {
      return '#bbf7d0'; // tw-green-200
    }
    return undefined;
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

  function openTechnicianForm(technician: Technician | undefined = undefined) {
    setTechnicianForm({
      ...technicianForm,
      open: true,
      technician,
    });
  }

  function closeTechnicianForm() {
    setTechnicianForm({
      ...technicianForm,
      open: false,
      technician: undefined,
    });
  }

  function onUpdateTechnician(updated: Technician) {
    setTechnicians(technicians.map((t) => (t.id === updated.id ? Object.assign({}, t, updated) : t)));
    closeTechnicianForm();
  }

  function onDeleteTechnician(deleted: Technician) {
    setTechnicians(technicians.filter((t) => t.id !== deleted.id));
    closeTechnicianForm();
  }

  function handleColumnHoverEnter(index: number) {
    setHoveredColumn(index);
  }

  function handleColumnHoverLeave() {
    setHoveredColumn(undefined);
  }

  return (
    <>
      <table className="border-collapse">
        <thead>
          <tr>
            <TableHeader></TableHeader>
            <TableHeader></TableHeader>
            {technicians.map((technician, index) => (
              <TableHeader
                key={technician.id}
                onMouseEnter={() => handleColumnHoverEnter(index)}
                onMouseLeave={() => handleColumnHoverLeave()}
                style={{
                  background: technician.bg_color,
                  color: technician.text_color,
                }}
              >
                <a
                  className="cursor-pointer"
                  onClick={() => {
                    if (!user?.is_superuser) {
                      return;
                    }
                    openTechnicianForm(technician);
                  }}
                  style={{ color: technician.text_color }}
                >
                  {technician.first_name} {technician.last_name}
                </a>
              </TableHeader>
            ))}
            <TableHeader>Total # of Techs</TableHeader>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => {
            const total = totalTechs(client);

            return (
              <React.Fragment key={client.id}>
                <tr className="hover:bg-border">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-left text-nowrap">
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
                  {technicians.map((technician, technicianIndex) => {
                    const count = countAppointments(client, technician);
                    const bgColor =
                      count > 0 ? technician.bg_color : hoveredColumn === technicianIndex ? 'var(--border)' : undefined;

                    return (
                      <TableCell
                        key={technician.id}
                        onMouseEnter={() => handleColumnHoverEnter(technicianIndex)}
                        onMouseLeave={() => handleColumnHoverLeave()}
                        style={{
                          background: bgColor,
                          color: count > 0 ? technician.text_color : undefined,
                        }}
                      >
                        {count > 0 ? count : ''}
                      </TableCell>
                    );
                  })}
                  <TableCell
                    className="text-black"
                    style={{
                      background: getTotalTechsColor(total),
                    }}
                  >
                    {total > 0 ? total : ''}
                  </TableCell>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
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
      {technicianForm.technician && (
        <Sheet
          open={technicianForm.open}
          onOpenChange={(open) => setTechnicianForm({ ...technicianForm, open, technician: undefined })}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Update Technician</SheetTitle>
            </SheetHeader>
            <TechnicianForm
              technician={technicianForm.technician}
              onCancel={() => {
                setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
              }}
              onUpdate={onUpdateTechnician}
              onDelete={onDeleteTechnician}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
