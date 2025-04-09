import React from 'react';
import { ClientModel, TechnicianModel } from '~/api';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import './ClientTechnicianMatrix.scss';
import { Spinner } from '~/ui';

export const ClientTechnicianMatrix = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = React.useState(true);

  React.useEffect(() => {
    ClientModel.all({
      page_size: 1000,
      expand_appointments: true,
    })
      .then((clients) => {
        setClients(clients);
      })
      .finally(() => {
        setLoadingClients(false);
      });
    TechnicianModel.all({
      page_size: 1000,
    })
      .then((technicians) => {
        setTechnicians(technicians);
      })
      .finally(() => {
        setLoadingTechnicians(false);
      });
  }, []);

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

  if (loadingClients || loadingTechnicians) {
    return <Spinner className="mt-8" message="Loading matrix..." />;
  }

  return (
    <>
      <table className="ClientTechnicianMatrix">
        <thead>
          <tr>
            <th></th>
            <th></th>
            {technicians.map((technician) => (
              <th
                key={technician.id}
                style={{
                  background: technician.bg_color,
                  color: technician.text_color,
                }}
              >
                {technician.first_name} {technician.last_name}
              </th>
            ))}
            <th>Total # of Techs</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => {
            const total = totalTechs(client);

            return (
              <React.Fragment key={client.id}>
                <tr>
                  <td>{index + 1}</td>
                  <td key={client.id}>
                    {client.first_name} {client.last_name}
                  </td>
                  {technicians.map((technician) => {
                    const count = countAppointments(client, technician);
                    return (
                      <td
                        key={technician.id}
                        style={{
                          background: count > 0 ? technician.bg_color : undefined,
                          color: count > 0 ? technician.text_color : undefined,
                        }}
                      >
                        {count}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      background: getTotalTechsColor(total),
                    }}
                  >
                    {total}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
