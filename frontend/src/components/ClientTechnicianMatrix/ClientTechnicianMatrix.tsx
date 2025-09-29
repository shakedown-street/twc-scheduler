import { ClientModel, TechnicianModel } from '@/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { orderByFirstName } from '@/utils/order';
import { Loader } from 'lucide-react';
import React from 'react';
import { ClientForm } from '../ClientForm/ClientForm';
import { TechnicianForm } from '../TechnicianForm/TechnicianForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import './ClientTechnicianMatrix.scss';

export const ClientTechnicianMatrix = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = React.useState(true);
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

  React.useEffect(() => {
    ClientModel.all({
      page_size: 1000,
      expand_appointments: true,
    })
      .then((clients) => {
        setClients(orderByFirstName<Client>(clients));
      })
      .finally(() => {
        setLoadingClients(false);
      });
    TechnicianModel.all({
      page_size: 1000,
    })
      .then((technicians) => {
        setTechnicians(orderByFirstName<Technician>(technicians));
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

  if (loadingClients || loadingTechnicians) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <table className="ClientTechnicianMatrix">
        <thead>
          <tr>
            <th></th>
            <th></th>
            {technicians.map((technician, index) => (
              <th
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
                  <td className="text-nowrap" style={{ textAlign: 'left' }}>
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
                  {technicians.map((technician, technicianIndex) => {
                    const count = countAppointments(client, technician);
                    return (
                      <td
                        key={technician.id}
                        onMouseEnter={() => handleColumnHoverEnter(technicianIndex)}
                        onMouseLeave={() => handleColumnHoverLeave()}
                        style={{
                          background:
                            count > 0 ? technician.bg_color : hoveredColumn === technicianIndex ? '#e5e7eb' : undefined,
                          color: count > 0 ? technician.text_color : undefined,
                        }}
                      >
                        {count > 0 ? count : ''}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      background: getTotalTechsColor(total),
                    }}
                  >
                    {total > 0 ? total : ''}
                  </td>
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
