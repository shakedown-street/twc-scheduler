import { useSchedule } from '@/contexts/ScheduleContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { skillLevelColor } from '@/utils/color';
import React from 'react';
import { ClientForm } from '../ClientForm/ClientForm';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

const TableHeader = ({ children, className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th className={cn('border border-black p-1 text-left text-[10px]', className)} {...props}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td className={cn('border border-black p-1 align-top text-xs', className)} {...props}>
      {children}
    </td>
  );
};

export const ClientTechnicianHistory = () => {
  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
  });

  const { user } = useAuth();
  const { clients, setClients } = useSchedule();

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

  function displayTechnicians(technicians: Technician[]) {
    return (
      <div className="flex flex-wrap gap-1">
        {technicians.map((t) => (
          <Badge
            key={t.id}
            style={{
              background: t.bg_color,
              color: t.text_color,
            }}
          >
            {t.first_name} {t.last_name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="max-h-200 overflow-auto">
        <table className="border-collapse">
          <colgroup>
            <col />
            <col />
            <col width="240px" />
            <col width="240px" />
            <col width="240px" />
          </colgroup>
          <thead>
            <tr>
              <TableHeader>Client</TableHeader>
              <TableHeader>Rating</TableHeader>
              <TableHeader>Current Technicians</TableHeader>
              <TableHeader>Past Technicians</TableHeader>
              <TableHeader>Sub Notes</TableHeader>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="even:bg-muted hover:bg-border">
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
                <TableCell
                  className="text-center text-black"
                  style={{ background: skillLevelColor(client.req_skill_level) }}
                >
                  {client.req_skill_level}
                </TableCell>
                <TableCell>{client.current_technicians && displayTechnicians(client.current_technicians)}</TableCell>
                <TableCell>{displayTechnicians(client.past_technicians)}</TableCell>
                <TableCell className="text-xs whitespace-pre-wrap">{client.sub_notes}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
