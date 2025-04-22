import React from 'react';
import { ClientModel } from '~/api';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { Badge, Button, Spinner } from '~/ui';
import './ClientTechnicianHistory.scss';

export const ClientTechnicianHistory = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);

  React.useEffect(() => {
    setClientsLoading(true);
    ClientModel.all({
      page_size: 1000,
      expand_technicians: true,
    }).then((clients) => {
      setClients(clients);
      setClientsLoading(false);
    });
  }, []);

  function displayTechnicians(technicians: Technician[]) {
    return (
      <div className="flex flex-wrap gap-1">
        {technicians.map((t) => (
          <Badge
            key={t.id}
            size="xs"
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
    return <Spinner className="mt-8" message="Loading clients..." />;
  }

  return (
    <div className="ClientTechnicianHistory__container">
      <table className="ClientTechnicianHistory">
        <colgroup>
          <col />
          <col width="240px" />
          <col width="240px" />
        </colgroup>
        <thead>
          <tr>
            <th>Client</th>
            <th>Current Technicians</th>
            <th>Past Technicians</th>
            {/* <th>Sub Notes</th> */}
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>
                <div className="flex flex-column align-start gap-1">
                  {client.first_name} {client.last_name}
                  <Button iconLeading="edit" size="xs">
                    Edit
                  </Button>
                </div>
              </td>
              <td>{displayTechnicians(client.current_technicians || [])}</td>
              <td>{displayTechnicians(client.past_technicians || [])}</td>
              {/* <td>{client.subNotes}</td> */}
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
    </div>
  );
};
