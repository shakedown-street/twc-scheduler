import clsx from 'clsx';
import React from 'react';
import { AvailabilityModel, BlockModel, ClientModel } from '~/api';
import { ClientForm } from '~/components/ClientForm/ClientForm';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Button, Card, Container, RadixDialog } from '~/ui';
import { formatTimeShort } from '~/utils/time';
import './ClientAvailability.scss';

export const ClientAvailability = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client: Client | undefined;
  }>({
    open: false,
    client: undefined,
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

  function openClientForm(client: Client | undefined = undefined) {
    setClientForm({
      ...clientForm,
      open: true,
      client,
    });
  }

  function onCreate(client: Client) {
    const copySorted = [...clients, client].sort((a, b) => a.first_name.localeCompare(b.first_name));

    setClients(copySorted);
    setClientForm({ ...clientForm, open: false, client: undefined });
  }

  function onUpdate(updated: Client) {
    setClients(clients.map((c) => (c.id === updated.id ? Object.assign({}, c, updated) : c)));
    setClientForm({ ...clientForm, open: false, client: undefined });
  }

  function onDelete(deleted: Client) {
    setClients(clients.filter((c) => c.id !== deleted.id));
    setClientForm({ ...clientForm, open: false, client: undefined });
  }

  function totalPrescribedHours() {
    return clients.reduce((total, client) => total + (client.prescribed_hours || 0), 0);
  }

  function isBlockAvailable(client: Client, day: number, block: Block) {
    return client.availabilities?.some((availability) => availability.day === day && availability.block === block.id);
  }

  function toggleAvailability(client: Client, day: number, block: Block) {
    if (isBlockAvailable(client, day, block)) {
      const availability = client.availabilities?.find(
        (availability) => availability.day === day && availability.block === block.id
      );

      if (!availability) {
        return;
      }

      AvailabilityModel.delete(availability.id).then(() => {
        client.availabilities = client.availabilities?.filter((a) => a.id !== availability.id);
        setClients([...clients]);
      });
    } else {
      AvailabilityModel.create({
        content_type: 13, // TODO: don't hardcode this!!!
        object_id: client.id,
        day: day,
        block: block.id,
      }).then((availability) => {
        client.availabilities = [...(client.availabilities || []), availability.data];
        setClients([...clients]);
      });
    }
  }

  function countClientsAvailableForBlock(day: number, block: Block) {
    return clients.filter((client) => isBlockAvailable(client, day, block)).length;
  }

  function renderAvailabilities(client: Client) {
    return days.map((day) =>
      blocks.map((block, index) => (
        <td
          key={block.id}
          className={clsx('ClientAvailability__table__block', {
            'ClientAvailability__table__block--first': index === 0,
            'ClientAvailability__table__block--last': index === blocks.length - 1,
          })}
          style={{
            backgroundColor: isBlockAvailable(client, day, block) ? block.color : undefined,
          }}
          onClick={() => toggleAvailability(client, day, block)}
        >
          {isBlockAvailable(client, day, block) && (
            <>
              {formatTimeShort(block.start_time)}-{formatTimeShort(block.end_time)}
            </>
          )}
        </td>
      ))
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
                  {renderAvailabilities(client)}
                  <td style={{ textAlign: 'right' }}>{client.prescribed_hours}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}></td>
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
            onCreate={onCreate}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      </RadixDialog>
    </>
  );
};
