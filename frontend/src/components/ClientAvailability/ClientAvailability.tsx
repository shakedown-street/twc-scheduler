import clsx from 'clsx';
import React from 'react';
import { ClientModel } from '~/api';
import { AvailabilityForm } from '~/components/AvailabilityForm/AvailabilityForm';
import { ClientForm } from '~/components/ClientForm/ClientForm';
import { useBlocks } from '~/contexts/BlocksContext';
import { useAuth } from '~/features/auth/contexts/AuthContext';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Button, Card, RadixDialog, Spinner } from '~/ui';
import { isFullBlock } from '~/utils/appointments';
import { skillLevelColor } from '~/utils/color';
import { formatTimeShort, isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
import './ClientAvailability.scss';

export const ClientAvailability = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);
  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
  });
  const [availabilityForm, setAvailabilityForm] = React.useState<{
    open: boolean;
    instance?: Availability;
    object?: Client;
    initialStartTime: string;
    initialEndTime: string;
    day: number;
  }>({
    open: false,
    instance: undefined,
    object: undefined,
    initialStartTime: '',
    initialEndTime: '',
    day: 0,
  });

  const { user } = useAuth();
  const { blocks } = useBlocks();

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    setClientsLoading(true);
    ClientModel.all({
      page_size: 1000,
      expand_availabilities: true,
    })
      .then((clients) => {
        setClients(clients);
      })
      .finally(() => {
        setClientsLoading(false);
      });
  }, []);

  function totalPrescribedHours() {
    return clients.reduce((total, client) => total + (client.prescribed_hours || 0), 0);
  }

  function totalAvailableHours() {
    return clients.reduce((total, client) => total + (client.total_hours_available || 0), 0);
  }

  function getBlockAvailability(client: Client, day: number, block: Block) {
    return client.availabilities?.find(
      (availability) =>
        availability.day === day &&
        isBetweenInclusiveStart(availability.start_time, block.start_time, block.end_time) &&
        isBetweenInclusiveEnd(availability.end_time, block.start_time, block.end_time)
    );
  }

  function countClientsAvailableForBlock(day: number, block: Block) {
    return clients.filter((client) => !!getBlockAvailability(client, day, block)).length;
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

  function onCreateClient(created: Client) {
    setClients((prev) => {
      return [...prev, created].sort((a, b) => a.first_name.localeCompare(b.first_name));
    });
    closeClientForm();
  }

  function onUpdateClient(updated: Client) {
    setClients(clients.map((c) => (c.id === updated.id ? Object.assign({}, c, updated) : c)));
    closeClientForm();
  }

  function onDeleteClient(deleted: Client) {
    setClients(clients.filter((c) => c.id !== deleted.id));
    closeClientForm();
  }

  function openAvailabilityForm(
    client: Client,
    day: number,
    block: Block,
    instance: Availability | undefined = undefined
  ) {
    setAvailabilityForm({
      ...availabilityForm,
      open: true,
      instance,
      object: client,
      day,
      initialStartTime: block.start_time,
      initialEndTime: block.end_time,
    });
  }

  function closeAvailabilityForm() {
    setAvailabilityForm({
      ...availabilityForm,
      open: false,
      instance: undefined,
      object: undefined,
      initialStartTime: '',
      initialEndTime: '',
    });
  }

  function onCreateAvailability(client: Client, created: Availability) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === client.id) {
          c.availabilities = [...(c.availabilities || []), created];
          return c;
        }
        return c;
      })
    );
    closeAvailabilityForm();
  }

  function onUpdateAvailability(client: Client, updated: Availability) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === client.id) {
          c.availabilities = c.availabilities?.map((a) => (a.id === updated.id ? updated : a));
          return c;
        }
        return c;
      })
    );
    closeAvailabilityForm();
  }

  function onDeleteAvailability(deleted: Availability) {
    setClients((prev) =>
      prev.map((c) => {
        c.availabilities = c.availabilities?.filter((a) => a.id !== deleted.id);
        return c;
      })
    );
    closeAvailabilityForm();
  }

  function renderAvailabilities(client: Client) {
    return days.map((day) =>
      blocks.map((block, index) => {
        const blockAvailability = getBlockAvailability(client, day, block);

        return (
          <td
            key={block.id}
            className={clsx('ClientAvailability__table__block', {
              'ClientAvailability__table__block--first': index === 0,
              'ClientAvailability__table__block--last': index === blocks.length - 1,
            })}
            style={{
              background: blockAvailability ? block.color : undefined,
            }}
            onClick={() => {
              if (!user?.is_superuser) {
                return;
              }
              if (blockAvailability) {
                openAvailabilityForm(client, day, block, blockAvailability);
              } else {
                openAvailabilityForm(client, day, block);
              }
            }}
          >
            {blockAvailability && (
              <div className="flex align-center gap-1">
                <div className="text-nowrap">
                  {formatTimeShort(blockAvailability.start_time)}-{formatTimeShort(blockAvailability.end_time)}
                </div>
                {blockAvailability.in_clinic && (
                  <span className="material-symbols-outlined text-size-sm" title="In clinic">
                    location_on
                  </span>
                )}
                {!isFullBlock(blockAvailability, block) && (
                  <span className="material-symbols-outlined text-color-red text-size-sm" title="Partially available">
                    warning
                  </span>
                )}
              </div>
            )}
          </td>
        );
      })
    );
  }

  function renderBlockTotals() {
    return days.map((day) =>
      blocks.map((block) => (
        <td
          key={block.id}
          className={clsx('ClientAvailability__table__block__count', {
            'ClientAvailability__table__block--first': block.id === 1,
            'ClientAvailability__table__block--last': block.id === blocks.length,
          })}
          style={{ textAlign: 'right' }}
        >
          {countClientsAvailableForBlock(day, block)}
        </td>
      ))
    );
  }

  if (clientsLoading) {
    return <Spinner className="mt-8" message="Loading clients..." />;
  }

  return (
    <>
      <Card fluid>
        <div className="flex align-center justify-between gap-4 mb-4">
          <h2>Clients</h2>
          {user?.is_superuser && (
            <Button color="primary" onClick={() => setClientForm({ ...clientForm, open: true })} variant="raised">
              Create Client
            </Button>
          )}
        </div>
        <table className="ClientAvailability__table">
          <thead>
            <tr>
              <th className="ClientAvailability__table--vertical"></th>
              <th title="Name" className="ClientAvailability__table--vertical"></th>
              <th title="Skill level requirement" className="ClientAvailability__table--vertical">
                Rating
              </th>
              <th title="Spanish speaker" className="ClientAvailability__table--vertical">
                Spa
              </th>
              <th title="Evaluation done" className="ClientAvailability__table--vertical">
                Eval
              </th>
              <th title="Currently onboarding" className="ClientAvailability__table--vertical">
                Onboard
              </th>
              <th title="Prescribed hours" className="ClientAvailability__table--vertical">
                Rx
              </th>
              <th title="Total available hours" className="ClientAvailability__table--vertical">
                Avail
              </th>
              {days.map((day) => (
                <th className="ClientAvailability__table__boldBorder" key={day} colSpan={blocks.length}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client.id}>
                <td>{index + 1}</td>
                <td>
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
                <td
                  style={{
                    background: skillLevelColor(client.req_skill_level),
                    textAlign: 'center',
                  }}
                >
                  {client.req_skill_level}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {client.req_spanish_speaking && (
                    <span className="material-symbols-outlined text-color-green text-size-sm">check</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {client.eval_done && (
                    <span className="material-symbols-outlined text-color-green text-size-sm">check</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {client.is_onboarding && (
                    <span className="material-symbols-outlined text-color-green text-size-sm">check</span>
                  )}
                </td>
                <td>{client.prescribed_hours}</td>
                <td>{client.total_hours_available}</td>
                {renderAvailabilities(client)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6}></td>
              <td>{totalPrescribedHours()}</td>
              <td>{totalAvailableHours()}</td>
              {renderBlockTotals()}
            </tr>
          </tfoot>
        </table>
      </Card>
      <RadixDialog
        title={`${clientForm.client ? 'Update' : 'Create'} Client`}
        open={clientForm.open}
        onOpenChange={(open) => setClientForm({ ...clientForm, open, client: undefined })}
      >
        <div className="p-6">
          <h3 className="mb-4">{clientForm.client ? 'Update' : 'Create'} Client</h3>
          <ClientForm
            client={clientForm.client}
            onCancel={() => {
              setClientForm({ ...clientForm, open: false, client: undefined });
            }}
            onCreate={onCreateClient}
            onDelete={onDeleteClient}
            onUpdate={onUpdateClient}
          />
        </div>
      </RadixDialog>
      <RadixDialog
        title={`${availabilityForm.instance ? 'Update' : 'Create'} Availability`}
        open={availabilityForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeAvailabilityForm();
          }
        }}
      >
        <div className="p-6">
          <h3 className="mb-4">{availabilityForm.instance ? 'Update' : 'Create'} Availability</h3>
          {availabilityForm.object && (
            <AvailabilityForm
              contentType="client"
              onCreate={(client, created) => onCreateAvailability(client as Client, created)}
              onUpdate={(client, updated) => onUpdateAvailability(client as Client, updated)}
              onDelete={(deleted) => onDeleteAvailability(deleted)}
              instance={availabilityForm.instance}
              object={availabilityForm.object}
              day={availabilityForm.day}
              initialStartTime={availabilityForm.initialStartTime}
              initialEndTime={availabilityForm.initialEndTime}
            />
          )}
        </div>
      </RadixDialog>
    </>
  );
};
