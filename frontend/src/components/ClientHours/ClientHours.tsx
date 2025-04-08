import React from 'react';
import { BlockModel, ClientModel } from '~/api';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { RadixHoverCard } from '~/ui/RadixHoverCard/RadixHoverCard';
import { isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
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
        isBetweenInclusiveStart(availability.start_time, block.start_time, block.end_time) &&
        isBetweenInclusiveEnd(availability.end_time, block.start_time, block.end_time)
      );
    });
  }

  function getAppointments(client: Client, day: number, block: Block) {
    return client.appointments?.filter((appointment) => {
      return (
        appointment.day === day &&
        isBetweenInclusiveStart(appointment.start_time, block.start_time, block.end_time) &&
        isBetweenInclusiveEnd(appointment.end_time, block.start_time, block.end_time)
      );
    });
  }

  function getSkillLevelColor(skillLevel: number) {
    switch (skillLevel) {
      case 1:
        return '#bbf7d0'; // tw-green-200
      case 2:
        return '#fef08a'; // tw-yellow-200
      case 3:
        return '#fecaca'; // tw-red-200
      default:
        return 'white';
    }
  }

  function blockBackground(client: Client, day: number, block: Block) {
    const appointments = getAppointments(client, day, block) || [];

    if (appointments.length > 0) {
      const appointment = appointments[0];
      if (appointment.in_clinic) {
        const color = appointment.technician?.color || 'white';
        return `repeating-linear-gradient(45deg, white, white 4px, ${color} 4px, ${color} 8px)`;
      }
      return appointment.technician?.color || 'white';
    }
    if (isAvailable(client, day, block)) {
      return '#cbd5e1'; // tw-slate-300
    }
    return '#404040'; // tw-neutral-700
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
            <React.Fragment key={day}>
              {blocks.map((block) => (
                <col key={block.id} width="32px" />
              ))}
            </React.Fragment>
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
              <React.Fragment key={day}>
                {blocks.map((block, blockIndex) => (
                  <th key={block.id}>
                    {day}
                    {blockIndex + 1}
                  </th>
                ))}
              </React.Fragment>
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
                  color: client.is_maxed_on_sessions ? '#dc2626' : '#16a34a',
                }}
              >
                {client.is_maxed_on_sessions ? 'M' : 'A'}
              </td>
              {days.map((day) => (
                <React.Fragment key={day}>
                  {blocks.map((block) => {
                    const blockAppointments = getAppointments(client, day, block) || [];

                    if (blockAppointments.length > 0) {
                      const appointment = blockAppointments[0];
                      return (
                        <RadixHoverCard
                          key={block.id}
                          portal
                          trigger={
                            <td
                              style={{
                                background: blockBackground(client, day, block),
                              }}
                            ></td>
                          }
                        >
                          <AppointmentHover appointment={appointment} />
                        </RadixHoverCard>
                      );
                    }

                    return (
                      <td
                        key={block.id}
                        style={{
                          background: blockBackground(client, day, block),
                        }}
                      ></td>
                    );
                  })}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
