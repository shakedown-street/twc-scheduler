import React from 'react';
import { BlockModel, TechnicianModel } from '~/api';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
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
        availability.start_time === block.start_time &&
        availability.end_time === block.end_time
      );
    });
  }

  function hasSession(technician: Technician, day: number, block: Block) {
    return technician.appointments?.some((appointment) => {
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

  function getCellColor(technician: Technician, day: number, block: Block) {
    if (hasSession(technician, day, block)) {
      return '#8ab053'; // green
    } else if (isAvailable(technician, day, block) && technician.is_maxed_on_sessions) {
      return '#8b0a17'; // red
    } else if (isAvailable(technician, day, block)) {
      return '#e7f3ff'; // white
    } else {
      return '#3c4656'; // gray
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
                  color: technician.is_maxed_on_sessions ? '#c91421' : '#03de1c',
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
                        backgroundColor: getCellColor(technician, day, block),
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
