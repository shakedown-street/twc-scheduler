import clsx from 'clsx';
import React from 'react';
import { AvailabilityModel, BlockModel, ClientModel } from '~/api';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Card, Container } from '~/ui';
import { formatTime } from '~/utils/format';
import './ClientAvailability.scss';

export const ClientAvailability = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);

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

  function renderBlockHeaders() {
    return days.map(() =>
      blocks.map((block) => (
        <th key={block.id}>
          {formatTime(block.start_time)}-{formatTime(block.end_time)}
        </th>
      ))
    );
  }

  function renderAvailabilities(client: Client) {
    return days.map((day) =>
      blocks.map((block) => (
        <td
          key={block.id}
          className={clsx('ClientAvailability__table__block', {
            'ClientAvailability__table__block--available': isBlockAvailable(client, day, block),
          })}
          onClick={() => toggleAvailability(client, day, block)}
        ></td>
      ))
    );
  }

  function renderBlockTotals() {
    return days.map((day) =>
      blocks.map((block) => (
        <td key={block.id} className="ClientAvailability__table__block__count">
          {countClientsAvailableForBlock(day, block)}
        </td>
      ))
    );
  }

  return (
    <>
      <Container>
        <h1 className="my-8">Client Availability</h1>
        <Card fluid>
          <table className="ClientAvailability__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rating</th>
                <th>Spanish</th>
                <th>Eval</th>
                {days.map((day) => (
                  <th key={day} colSpan={3}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                  </th>
                ))}
                <th>Rx Hrs</th>
              </tr>
              <tr>
                <th colSpan={4}></th>
                {renderBlockHeaders()}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    {client.first_name} {client.last_name}
                  </td>
                  <td>{client.req_skill_level}</td>
                  <td>{client.req_spanish_speaking ? 'Yes' : 'No'}</td>
                  <td>{client.eval_done ? 'Yes' : 'No'}</td>
                  {renderAvailabilities(client)}
                  <td>{client.prescribed_hours}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}></td>
                {renderBlockTotals()}
                <td>{totalPrescribedHours()}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </Container>
    </>
  );
};
