import React from 'react';
import { BlockModel, TechnicianModel } from '~/api';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { RadixHoverCard } from '~/ui/RadixHoverCard/RadixHoverCard';
import { isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import './TechnicianHours.scss';

export const TechnicianHours = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    TechnicianModel.all({
      expand_appointments: true,
      expand_availabilities: true,
    }).then((technicians) => {
      setTechnicians(technicians);
    });
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
  }, []);

  function isAvailable(technician: Technician, day: number, block: Block) {
    return technician.availabilities?.some((availability) => {
      return (
        availability.day === day &&
        isBetweenInclusiveStart(availability.start_time, block.start_time, block.end_time) &&
        isBetweenInclusiveEnd(availability.end_time, block.start_time, block.end_time)
      );
    });
  }

  function getAppointments(technician: Technician, day: number, block: Block) {
    return technician.appointments?.filter((appointment) => {
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

  function blockBackground(technician: Technician, day: number, block: Block) {
    const appointments = getAppointments(technician, day, block) || [];

    if (appointments.length > 0) {
      const appointment = appointments[0];
      const color = appointment.client?.is_onboarding ? '#eab308' : '#15803d'; // tw-yellow-500 : tw-green-700
      if (appointment.in_clinic) {
        return `repeating-linear-gradient(45deg, white, white 4px, ${color} 4px, ${color} 8px)`;
      }
      return `${color}`;
    } else if (isAvailable(technician, day, block) && technician.is_maxed_on_sessions) {
      return '#b91c1c'; // tw-red-700
    } else if (isAvailable(technician, day, block)) {
      return '#cbd5e1'; // tw-slate-300
    } else {
      return '#404040'; // tw-neutral-700
    }
  }

  function renderLegend() {
    return (
      <div className="TechnicianHours__legend">
        <div className="TechnicianHours__legend__example">
          <div className="TechnicianHours__legend__example__color" style={{ background: '#404040' }}></div>
          <span>Unavailable</span>
        </div>
        <div className="TechnicianHours__legend__example">
          <div className="TechnicianHours__legend__example__color" style={{ background: '#cbd5e1' }}></div>
          <span>Available</span>
        </div>
        <div className="TechnicianHours__legend__example">
          <div className="TechnicianHours__legend__example__color" style={{ background: '#b91c1c' }}></div>
          <span>Maxed on Sessions</span>
        </div>
        <div className="TechnicianHours__legend__example">
          <div className="TechnicianHours__legend__example__color" style={{ background: '#15803d' }}></div>
          <span>Has Session</span>
        </div>
        <div className="TechnicianHours__legend__example">
          <div className="TechnicianHours__legend__example__color" style={{ background: '#eab308' }}></div>
          <span>Onboarding</span>
        </div>
        <div className="TechnicianHours__legend__example">
          <div
            className="TechnicianHours__legend__example__color"
            style={{ background: 'repeating-linear-gradient(45deg, white, white 4px, black 4px, black 8px)' }}
          ></div>
          <span>In Clinic</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <table className="TechnicianHours">
        <colgroup>
          <col width="24px" />
          <col width="24px" />
          <col width="32px" />
          <col />
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
            <th>Hrs</th>
            <th>Wanted</th>
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
          {technicians.map((technician, index) => (
            <tr key={technician.id}>
              <td style={{ backgroundColor: technician.color }}>{index + 1}</td>
              <td style={{ backgroundColor: getSkillLevelColor(technician.skill_level) }}>{technician.skill_level}</td>
              <td
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                }}
              >
                {technician.spanish_speaking && (
                  <span className="material-symbols-outlined text-color-green text-size-sm display-block">check</span>
                )}
              </td>
              <td style={{ backgroundColor: technician.color }}>
                {technician.first_name} {technician.last_name}
              </td>
              <td>{technician.total_hours_by_day[0]}</td>
              <td>{technician.total_hours_by_day[1]}</td>
              <td>{technician.total_hours_by_day[2]}</td>
              <td>{technician.total_hours_by_day[3]}</td>
              <td>{technician.total_hours_by_day[4]}</td>
              <td>{technician.total_hours}</td>
              <td>{technician.requested_hours}</td>
              <td
                style={{
                  color: technician.is_maxed_on_sessions ? '#dc2626' : '#16a34a',
                }}
              >
                {technician.is_maxed_on_sessions ? 'M' : 'A'}
              </td>
              {days.map((day) => (
                <React.Fragment key={day}>
                  {blocks.map((block) => {
                    const blockAppointments = getAppointments(technician, day, block) || [];

                    if (blockAppointments.length > 0) {
                      const appointment = blockAppointments[0];
                      return (
                        <RadixHoverCard
                          key={block.id}
                          portal
                          trigger={
                            <td
                              style={{
                                background: blockBackground(technician, day, block),
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
                          background: blockBackground(technician, day, block),
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
