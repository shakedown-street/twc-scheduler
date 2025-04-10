import React from 'react';
import { ClientModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Availability } from '~/types/Availability';
import { Client } from '~/types/Client';
import { Spinner } from '~/ui';

// Not in use ATM

export type ClientsContextType = {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (client: Client) => void;
  addClientAvailability: (availability: Availability) => void;
  updateClientAvailability: (availability: Availability) => void;
  removeClientAvailability: (availability: Availability) => void;
  addClientAppointment: (appointment: Appointment) => void;
  updateClientAppointment: (appointment: Appointment) => void;
  removeClientAppointment: (appointment: Appointment) => void;
};

export const ClientsContext = React.createContext<ClientsContextType | undefined>(undefined);

export type ClientsProviderProps = {
  children: React.ReactNode;
};

export const ClientsProvider = (props: ClientsProviderProps) => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    ClientModel.all({
      page_size: 1000,
      expand_availabilities: true,
      expand_appointments: true,
    })
      .then((clients) => {
        setClients(clients);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function addClient(client: Client) {
    setClients((prev) => {
      return [...prev, client].sort((a, b) => a.first_name.localeCompare(b.first_name));
    });
  }

  function updateClient(client: Client) {
    setClients(clients.map((c) => (c.id === client.id ? Object.assign({}, c, client) : c)));
  }

  function removeClient(client: Client) {
    setClients(clients.filter((c) => c.id !== client.id));
  }

  function addClientAvailability(availability: Availability) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === availability.object_id) {
          c.availabilities = [...(c.availabilities || []), availability];
          return c;
        }
        return c;
      })
    );
  }

  function updateClientAvailability(availability: Availability) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === availability.object_id) {
          c.availabilities = c.availabilities?.map((a) => (a.id === availability.id ? availability : a));
          return c;
        }
        return c;
      })
    );
  }

  function removeClientAvailability(availability: Availability) {
    setClients((prev) =>
      prev.map((c) => {
        c.availabilities = c.availabilities?.filter((a) => a.id !== availability.id);
        return c;
      })
    );
  }

  function addClientAppointment(appointment: Appointment) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === appointment.client?.id) {
          c.appointments = [...(c.appointments || []), appointment];
          return c;
        }
        return c;
      })
    );
  }

  function updateClientAppointment(appointment: Appointment) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === appointment.client?.id) {
          c.appointments = c.appointments?.map((a) => (a.id === appointment.id ? appointment : a));
          return c;
        }
        return c;
      })
    );
  }

  function removeClientAppointment(appointment: Appointment) {
    setClients((prev) =>
      prev.map((c) => {
        c.appointments = c.appointments?.filter((a) => a.id !== appointment.id);
        return c;
      })
    );
  }

  if (loading) {
    return <Spinner className="mt-8" message="Loading clients..." />;
  }

  return (
    <ClientsContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        removeClient,
        addClientAvailability,
        updateClientAvailability,
        removeClientAvailability,
        addClientAppointment,
        updateClientAppointment,
        removeClientAppointment,
      }}
    >
      {props.children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  const context = React.useContext(ClientsContext);

  if (context === undefined) {
    throw new Error('useClients must be used within an ClientsProvider');
  }

  return context;
};
