import clsx from 'clsx';
import React from 'react';
import { BlockModel, ClientModel } from '~/api';
import { AvailabilityForm } from '~/components/AvailabilityForm/AvailabilityForm';
import { ClientForm } from '~/components/ClientForm/ClientForm';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Button, Card, Container, RadixDialog } from '~/ui';
import { formatTimeShort, isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
import './ClientAvailability.scss';

export const ClientAvailability = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
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

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
    ClientModel.all({
      expand_availabilities: true,
    }).then((clients) => {
      setClients(clients);
    });
  }, []);

  function totalPrescribedHours() {
    return clients.reduce((total, client) => total + (client.prescribed_hours || 0), 0);
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
              backgroundColor: blockAvailability ? block.color : undefined,
            }}
            onClick={() => {
              if (blockAvailability) {
                openAvailabilityForm(client, day, block, blockAvailability);
              } else {
                openAvailabilityForm(client, day, block);
              }
            }}
          >
            {blockAvailability && (
              <>
                {formatTimeShort(blockAvailability.start_time)}-{formatTimeShort(blockAvailability.end_time)}
              </>
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

  return (
    <>
      <Container>
        <div className="flex align-center justify-between gap-4 my-8">
          <h1>Client Availability</h1>
          <Button color="primary" onClick={() => setClientForm({ ...clientForm, open: true })} variant="raised">
            Create Client
          </Button>
        </div>
        <Card fluid>
          <table className="ClientAvailability__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rating</th>
                <th>Spanish</th>
                <th>Eval</th>
                <th>Onboarding</th>
                {days.map((day) => (
                  <th className="ClientAvailability__table__boldBorder" key={day} colSpan={blocks.length}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                  </th>
                ))}
                <th>Rx Hrs</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <a href="#" onClick={() => openClientForm(client)}>
                      {client.first_name} {client.last_name}
                    </a>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    {client.req_skill_level}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {client.req_spanish_speaking && (
                      <span className="material-symbols-outlined text-color-green">check</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {client.eval_done && <span className="material-symbols-outlined text-color-green">check</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {client.is_onboarding && <span className="material-symbols-outlined text-color-green">check</span>}
                  </td>
                  {renderAvailabilities(client)}
                  <td style={{ textAlign: 'right' }}>{client.prescribed_hours}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}></td>
                {renderBlockTotals()}
                <td style={{ textAlign: 'right' }}>{totalPrescribedHours()}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </Container>
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
