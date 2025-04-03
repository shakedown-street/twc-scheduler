import React from 'react';
import { BlockModel, ClientModel } from '~/api';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import './ClientHours.scss';

export const ClientHours = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    ClientModel.all({
      expand_appointments: true,
      expand_availabilities: true,
    }).then((clients) => {
      setClients(clients);
    });
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
  }, []);

  function isAvailable(client: Client, day: number, block: Block) {
    return client.availabilities?.some((availability) => {
      return (
        availability.day === day &&
        availability.start_time === block.start_time &&
        availability.end_time === block.end_time
      );
    });
  }

  function getSessions(client: Client, day: number, block: Block) {
    return client.appointments?.filter((appointment) => {
      return (
        appointment.day === day &&
        appointment.start_time === block.start_time &&
        appointment.end_time === block.end_time
      );
    });
  }

  function getSkillLevelColor(skillLevel: number) {
    switch (skillLevel) {
      case 1:
        return '#bbe2cf'; // green
      case 2:
        return '#fcf4c4'; // yellow
      case 3:
        return '#f7d1cf'; // red
      default:
        return 'white';
    }
  }

  function getCellColor(client: Client, day: number, block: Block) {
    const sessions = getSessions(client, day, block) || [];

    if (sessions.length > 0) {
      return sessions[0].technician_color;
    }

    if (isAvailable(client, day, block)) {
      return '#e7f3ff'; // white
    }

    return '#3c4656'; // gray
  }

  return (
    <>
      <table className="ClientHours">
        <colgroup>
          <col width="48px" />
          <col width="48px" />
          <col width="48px" />
          <col />
          <col width="48px" />
          <col width="48px" />
          <col width="48px" />
          <col width="48px" />
          <col width="48px" />
          <col width="96px" />
          <col width="96px" />
          <col width="48px" />
          {['M', 'T', 'W', 'TH', 'F'].map((day) => (
            <>
              {blocks.map((block, blockIndex) => (
                <col key={block.id} width="32px" />
              ))}
            </>
          ))}
        </colgroup>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Spa</th>
            <th>Name</th>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>TH</th>
            <th>F</th>
            <th>Wk Hr</th>
            <th>Rx</th>
            <th></th>
            {['M', 'T', 'W', 'TH', 'F'].map((day) => (
              <>
                {blocks.map((block, blockIndex) => (
                  <th key={block.id}>
                    {day}
                    {blockIndex + 1}
                  </th>
                ))}
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id}>
              <td>{index + 1}</td>
              <td style={{ backgroundColor: getSkillLevelColor(client.req_skill_level) }}>{client.req_skill_level}</td>
              <td>{client.req_spanish_speaking ? 'yes' : 'no'}</td>
              <td>
                {client.first_name} {client.last_name}
              </td>
              <td>{client.total_hours_by_day[0]}</td>
              <td>{client.total_hours_by_day[1]}</td>
              <td>{client.total_hours_by_day[2]}</td>
              <td>{client.total_hours_by_day[3]}</td>
              <td>{client.total_hours_by_day[4]}</td>
              <td>{client.total_hours}</td>
              <td>{client.prescribed_hours}</td>
              <td
                style={{
                  color: client.is_maxed_on_sessions ? '#c91421' : '#03de1c',
                }}
              >
                {client.is_maxed_on_sessions ? 'M' : 'A'}
              </td>
              {days.map((day) => (
                <>
                  {blocks.map((block) => (
                    <td
                      key={block.id}
                      style={{
                        backgroundColor: getCellColor(client, day, block),
                      }}
                    ></td>
                  ))}
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
