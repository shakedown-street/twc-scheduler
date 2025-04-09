import React from 'react';
import { BlockModel, TechnicianModel } from '~/api';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { RadixHoverCard } from '~/ui/RadixHoverCard/RadixHoverCard';
import { getBlockAppointments, getBlockAvailabilities } from '~/utils/appointments';
import { dayColor, skillLevelColor } from '~/utils/color';
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

  function blockBackground(technician: Technician, day: number, block: Block) {
    const appointments = getBlockAppointments(technician.appointments || [], day, block) || [];
    const availabilities = getBlockAvailabilities(technician.availabilities || [], day, block) || [];

    if (appointments.length > 0) {
      const appointment = appointments[0];
      const color = appointment.client?.is_onboarding ? '#eab308' : '#15803d'; // tw-yellow-500 : tw-green-700
      if (appointment.in_clinic) {
        return `repeating-linear-gradient(45deg, white, white 4px, ${color} 4px, ${color} 8px)`;
      }
      return `${color}`;
    } else if (availabilities.length > 0 && technician.is_maxed_on_sessions) {
      return '#b91c1c'; // tw-red-700
    } else if (availabilities.length > 0) {
      return '#cbd5e1'; // tw-slate-300
    } else {
      return '#404040'; // tw-neutral-700
    }
  }

  function totalHoursByDay(day: number) {
    return technicians.reduce((acc, technician) => acc + technician.total_hours_by_day[day], 0);
  }

  function totalHours() {
    return technicians.reduce((acc, technician) => acc + technician.total_hours, 0);
  }

  function totalRequestedHours() {
    return technicians.reduce((acc, technician) => acc + technician.requested_hours, 0);
  }

  function availableTechsCount(day: number, block: Block) {
    return technicians.reduce((acc, technician) => {
      const appointments = getBlockAppointments(technician.appointments || [], day, block) || [];
      const availabilities = getBlockAvailabilities(technician.availabilities || [], day, block) || [];
      return acc + (appointments.length < 1 && availabilities.length > 0 ? 1 : 0);
    }, 0);
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
          <col />
          <col width="192px" />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col width="24px" />
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
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
            <th title="Skill level"></th>
            <th title="Spanish speaker">Spa</th>
            <th title="Name"></th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th title="Hours scheduled">Hrs</th>
            <th title="Hours requested">Req</th>
            <th title="Available"></th>
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
          {technicians.map((technician, index) => (
            <tr key={technician.id}>
              <td style={{ backgroundColor: technician.color, textAlign: 'center' }}>{index + 1}</td>
              <td style={{ backgroundColor: skillLevelColor(technician.skill_level), textAlign: 'center' }}>
                {technician.skill_level}
              </td>
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
              <td style={{ textAlign: 'center' }}>{technician.total_hours_by_day[0]}</td>
              <td style={{ textAlign: 'center' }}>{technician.total_hours_by_day[1]}</td>
              <td style={{ textAlign: 'center' }}>{technician.total_hours_by_day[2]}</td>
              <td style={{ textAlign: 'center' }}>{technician.total_hours_by_day[3]}</td>
              <td style={{ textAlign: 'center' }}>{technician.total_hours_by_day[4]}</td>
              <td style={{ textAlign: 'center' }}>{technician.total_hours}</td>
              <td style={{ textAlign: 'center' }}>{technician.requested_hours}</td>
              <td
                style={{
                  backgroundColor: 'black',
                  color: technician.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {technician.is_maxed_on_sessions ? 'M' : 'A'}
              </td>
              {days.map((day) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => {
                    const blockAppointments = getBlockAppointments(technician.appointments || [], day, block) || [];

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
                          background: blockBackground(technician, day, block),
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
        <tfoot>
          <tr>
            <td colSpan={4} style={{ textAlign: 'center' }}>
              Total
            </td>
            <td style={{ textAlign: 'center' }}>{totalHoursByDay(0)}</td>
            <td style={{ textAlign: 'center' }}>{totalHoursByDay(1)}</td>
            <td style={{ textAlign: 'center' }}>{totalHoursByDay(2)}</td>
            <td style={{ textAlign: 'center' }}>{totalHoursByDay(3)}</td>
            <td style={{ textAlign: 'center' }}>{totalHoursByDay(4)}</td>
            <td style={{ textAlign: 'center' }}>{totalHours()}</td>
            <td style={{ textAlign: 'center' }}>{totalRequestedHours()}</td>
            <td></td>
            {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
              <React.Fragment key={day}>
                {blocks.map((block, blockIndex) => (
                  <td
                    key={block.id}
                    style={{
                      borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                      borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                      textAlign: 'center',
                    }}
                  >
                    {availableTechsCount(dayIndex, block)}
                  </td>
                ))}
              </React.Fragment>
            ))}
          </tr>
        </tfoot>
      </table>
      {renderLegend()}
    </>
  );
};
