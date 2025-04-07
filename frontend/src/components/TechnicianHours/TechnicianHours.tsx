import React from 'react';
import { BlockModel, TechnicianModel } from '~/api';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
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

  return (
    <>
      <table className="TechnicianHours">
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
          {['M', 'T', 'W', 'TH', 'F'].map(() => (
            <>
              {blocks.map((block) => (
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
            <th>Hrs</th>
            <th>Wanted</th>
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
          {technicians.map((technician, index) => (
            <tr key={technician.id}>
              <td style={{ backgroundColor: technician.color }}>{index + 1}</td>
              <td style={{ backgroundColor: getSkillLevelColor(technician.skill_level) }}>{technician.skill_level}</td>
              <td>{technician.spanish_speaking ? 'yes' : 'no'}</td>
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
                <>
                  {blocks.map((block) => (
                    <td
                      key={block.id}
                      style={{
                        background: blockBackground(technician, day, block),
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
