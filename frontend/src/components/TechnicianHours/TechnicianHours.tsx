import React from 'react';
import { TechnicianModel } from '~/api';
import { useBlocks } from '~/contexts/BlocksContext';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Spinner } from '~/ui';
import { RadixHoverCard } from '~/ui/RadixHoverCard/RadixHoverCard';
import { getBlockAppointments, getBlockAvailabilities } from '~/utils/appointments';
import { dayColor, skillLevelColor, striped } from '~/utils/color';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import './TechnicianHours.scss';

export const TechnicianHours = () => {
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [techniciansLoading, setTechniciansLoading] = React.useState(true);

  const { blocks } = useBlocks();

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    setTechniciansLoading(true);
    TechnicianModel.all({
      page_size: 1000,
      expand_appointments: true,
      expand_availabilities: true,
    })
      .then((technicians) => {
        setTechnicians(technicians);
      })
      .finally(() => {
        setTechniciansLoading(false);
      });
  }, []);

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

  function renderBlock(client: Technician, day: number, block: Block, blockIndex: number) {
    const blockAppointments = getBlockAppointments(client.appointments || [], day, block) || [];
    const blockAvailabilities = getBlockAvailabilities(client.availabilities || [], day, block) || [];

    const borderLeftWidth = blockIndex === 0 ? '6px' : '1px';
    const borderRightWidth = blockIndex === blocks.length - 1 ? '6px' : '1px';

    // Render appointment blocks
    if (blockAppointments.length > 0) {
      const appointment = blockAppointments[0];
      const bgColor = appointment.client?.is_onboarding ? '#eab308' : '#15803d'; // tw-yellow-500 : tw-green-700
      let background = bgColor;
      if (appointment.in_clinic) {
        background = striped('black', bgColor);
      }
      return (
        <RadixHoverCard
          key={block.id}
          portal
          trigger={
            <td
              style={{
                background,
                borderLeftWidth,
                borderRightWidth,
              }}
            ></td>
          }
        >
          <AppointmentHover appointment={appointment} />
        </RadixHoverCard>
      );
    }

    // Render availability blocks
    if (blockAvailabilities.length > 0) {
      let background = '#cbd5e1'; // tw-slate-300
      if (client.is_maxed_on_sessions) {
        background = 'black';
      }
      return (
        <td
          key={block.id}
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
            color: client.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {client.is_maxed_on_sessions ? 'M' : 'A'}
        </td>
      );
    }

    // Render unavailable blocks
    return (
      <td
        key={block.id}
        style={{
          background: '#404040', // tw-neutral-700
          borderLeftWidth,
          borderRightWidth,
        }}
      ></td>
    );
  }

  function renderLegend() {
    return (
      <div className="TechnicianHours__legend">
        <div className="TechnicianHours__legend__example">
          <div className="TechnicianHours__legend__example__color" style={{ background: '#404040' }}></div>
          <span>Unavailable</span>
        </div>
        <div className="ClientHours__legend__example">
          <div className="ClientHours__legend__example__color" style={{ background: '#cbd5e1', color: '#22c55e' }}>
            A
          </div>
          <span>Available</span>
        </div>
        <div className="ClientHours__legend__example">
          <div className="ClientHours__legend__example__color" style={{ background: 'black', color: '#b91c1c' }}>
            M
          </div>
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
            style={{ background: striped('black', 'white') }}
          ></div>
          <span>In Clinic</span>
        </div>
      </div>
    );
  }

  if (techniciansLoading) {
    return <Spinner className="mt-8" message="Loading technicians..." />;
  }

  return (
    <div className="flex gap-4">
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
              <td style={{ background: technician.bg_color, color: technician.text_color, textAlign: 'center' }}>
                {index + 1}
              </td>
              <td style={{ background: skillLevelColor(technician.skill_level), textAlign: 'center' }}>
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
              <td style={{ background: technician.bg_color, color: technician.text_color }}>
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
                  background: 'black',
                  color: technician.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {technician.is_maxed_on_sessions ? 'M' : 'A'}
              </td>
              {days.map((day) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <React.Fragment key={block.id}>{renderBlock(technician, day, block, blockIndex)}</React.Fragment>
                  ))}
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
          <tr>
            <td colSpan={12}></td>
            <td
              colSpan={15}
              style={{
                borderLeftWidth: '6px',
                borderRightWidth: '6px',
              }}
            >
              Total Available
            </td>
          </tr>
        </tfoot>
      </table>
      {renderLegend()}
    </div>
  );
};
