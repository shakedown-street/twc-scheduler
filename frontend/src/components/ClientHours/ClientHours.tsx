import React from 'react';
import { BlockModel, ClientModel } from '~/api';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { RadixHoverCard } from '~/ui/RadixHoverCard/RadixHoverCard';
import { getBlockAppointments, getBlockAvailabilities } from '~/utils/appointments';
import { dayColor, skillLevelColor } from '~/utils/color';
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

  function blockBackground(client: Client, day: number, block: Block) {
    const appointments = getBlockAppointments(client.appointments || [], day, block) || [];
    const availabilities = getBlockAvailabilities(client.availabilities || [], day, block) || [];

    if (appointments.length > 0) {
      const appointment = appointments[0];
      if (appointment.in_clinic) {
        const color = appointment.technician?.color || 'white';
        return `repeating-linear-gradient(45deg, white, white 4px, ${color} 4px, ${color} 8px)`;
      }
      return appointment.technician?.color || 'white';
    } else if (availabilities.length > 0 && client.is_maxed_on_sessions) {
      return '#b91c1c'; // tw-red-700
    } else if (availabilities.length > 0) {
      return '#cbd5e1'; // tw-slate-300
    } else {
      return '#404040'; // tw-neutral-700
    }
  }

  function renderLegend() {
    return (
      <div className="ClientHours__legend">
        <div className="ClientHours__legend__example">
          <div className="ClientHours__legend__example__color" style={{ background: '#404040' }}></div>
          <span>Unavailable</span>
        </div>
        <div className="ClientHours__legend__example">
          <div className="ClientHours__legend__example__color" style={{ background: '#cbd5e1' }}></div>
          <span>Available</span>
        </div>
        <div className="ClientHours__legend__example">
          <div className="ClientHours__legend__example__color" style={{ background: '#b91c1c' }}></div>
          <span>Maxed on Sessions</span>
        </div>
        <div className="ClientHours__legend__example">
          <div
            className="ClientHours__legend__example__color"
            style={{ background: 'repeating-linear-gradient(45deg, white, white 4px, black 4px, black 8px)' }}
          ></div>
          <span>In Clinic</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <table className="ClientHours">
        <colgroup>
          <col width="24px" />
          <col width="24px" />
          <col width="32px" />
          <col width="192px" />
          <col width="32px" />
          <col width="32px" />
          <col width="32px" />
          <col width="32px" />
          <col width="32px" />
          <col width="48px" />
          <col width="48px" />
          <col width="24px" />
          {['M', 'T', 'W', 'TH', 'F'].map((day) => (
            <React.Fragment key={day}>
              {blocks.map((block) => (
                <col key={block.id} width="28px" />
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
            {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
              <React.Fragment key={day}>
                {blocks.map((block, blockIndex) => (
                  <th
                    key={block.id}
                    style={{
                      background: dayColor(dayIndex),
                      borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                      borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                    }}
                  >
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
              <td style={{ backgroundColor: skillLevelColor(client.req_skill_level) }}>{client.req_skill_level}</td>
              <td
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                }}
              >
                {client.req_spanish_speaking && (
                  <span className="material-symbols-outlined text-color-green text-size-sm display-block">check</span>
                )}
              </td>
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
                  {blocks.map((block, blockIndex) => {
                    const blockAppointments = getBlockAppointments(client.appointments || [], day, block) || [];

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
                                borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                                borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
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
                          borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                          borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
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
      {renderLegend()}
    </>
  );
};
