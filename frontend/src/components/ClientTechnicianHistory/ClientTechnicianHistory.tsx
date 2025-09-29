import { ClientModel } from '@/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { skillLevelColor } from '@/utils/color';
import { orderByFirstName } from '@/utils/order';
import { Loader } from 'lucide-react';
import React from 'react';
import { ClientForm } from '../ClientForm/ClientForm';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import './ClientTechnicianHistory.scss';

export const ClientTechnicianHistory = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);

  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
  });

  const { user } = useAuth();

  React.useEffect(() => {
    setClientsLoading(true);

    const fetchClients = () => {
      ClientModel.all({
        page_size: 1000,
        expand_technicians: true,
      }).then((clients) => {
        setClients(orderByFirstName<Client>(clients));
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

  if (clientsLoading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="ClientTechnicianHistory__container">
        <table className="ClientTechnicianHistory">
          <colgroup>
            <col />
            <col />
            <col width="240px" />
            <col width="240px" />
            <col width="240px" />
          </colgroup>
          <thead>
            <tr>
              <th>Client</th>
              <th>Rating</th>
              <th>Current Technicians</th>
              <th>Past Technicians</th>
              <th>Sub Notes</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="text-nowrap">
                  <a
                    className="cursor-pointer"
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
                <td style={{ background: skillLevelColor(client.req_skill_level), textAlign: 'center' }}>
                  {client.req_skill_level}
                </td>
                <td>{displayTechnicians(client.current_technicians)}</td>
                <td>{displayTechnicians(client.past_technicians)}</td>
                <td>{client.sub_notes}</td>
              </tr>
            ))}
            <tr></tr>
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
