import { useAuth } from '@/features/auth/contexts/AuthContext';
import { skillLevelColor, striped } from '@/utils/color';
import {
  addMinutes,
  dayToString,
  formatTimeTimeline,
  generateTimeSlots,
  isBetweenInclusiveStart,
  isOnTheHour,
  removeMinutes,
} from '@/utils/time';
import React from 'react';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import './TimeSlotTable.scss';

export type TimeSlotTableProps = {
  blocks: Block[];
  clients: Client[];
  day: number;
  onClickClient?: (client: Client) => void;
  onClickBlockSlot?: (client: Client, block: Block) => void;
  onClickAvailabilitySlot: (client: Client, block: Block, availability: Availability) => void;
  onClickAppointmentSlot?: (
    client: Client,
    block: Block,
    appointment: Appointment,
    availability?: Availability,
  ) => void;
  onShiftClick?: (client: Client, time: string, therapyAppointment?: TherapyAppointment) => void;
};

export const TimeSlotTable = ({
  blocks,
  clients,
  day,
  onClickClient,
  onClickBlockSlot,
  onClickAvailabilitySlot,
  onClickAppointmentSlot,
  onShiftClick,
}: TimeSlotTableProps) => {
  const [timeSlots, setTimeSlots] = React.useState<string[]>([]);

  const { user } = useAuth();

  React.useEffect(() => {
    // NOTE: We show an hour before the first block and an hour after the last block
    setTimeSlots(
      generateTimeSlots(
        removeMinutes(blocks[0].start_time, 60),
        addMinutes(blocks[blocks.length - 1].end_time, 60),
        15,
      ),
    );
  }, [blocks]);

  function getSlotBlock(time: string) {
    return blocks.find((block) => {
      return isBetweenInclusiveStart(time, block.start_time, block.end_time);
    });
  }

  function getSlotAvailability(time: string, availabilities: Availability[]) {
    if (!availabilities || availabilities.length === 0) {
      return undefined;
    }

    return availabilities
      .filter((a) => a.day === day)
      .find((availability) => {
        return isBetweenInclusiveStart(time, availability.start_time, availability.end_time);
      });
  }

  function getSlotAppointment(time: string, appointments: Appointment[]) {
    if (!appointments || appointments.length === 0) {
      return undefined;
    }

    return appointments
      .filter((a) => a.day === day)
      .find((appointment) => {
        return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
      });
  }

  function getSlotTherapyAppointment(time: string, therapyAppointments: TherapyAppointment[]) {
    if (!therapyAppointments || therapyAppointments.length === 0) {
      return undefined;
    }

    return therapyAppointments
      .filter((a) => a.day === day)
      .find((therapyAppointment) => {
        return isBetweenInclusiveStart(time, therapyAppointment.start_time, therapyAppointment.end_time);
      });
  }

  function slotBackground(time: string, client: Client) {
    const slotTherapyAppointment = getSlotTherapyAppointment(time, client.therapy_appointments || []);
    const slotAppointment = getSlotAppointment(time, client.appointments || []);
    const slotAvailability = getSlotAvailability(time, client.availabilities || []);
    const slotBlock = getSlotBlock(time);

    if (slotTherapyAppointment) {
      return 'black';
    }
    if (slotAppointment && !slotTherapyAppointment) {
      if (slotAppointment.in_clinic) {
        const bgColor = slotAppointment.technician?.bg_color || 'white';
        const textColor = slotAppointment.technician?.text_color || 'black';
        return striped(textColor, bgColor);
      }
      return slotAppointment.technician?.bg_color || 'white';
    }
    if (slotAvailability) {
      return '#cbd5e1'; // tw-slate-300
    }
    if (slotBlock) {
      return 'white';
    }
    return '#404040'; // tw-neutral-700
  }

  function slotText(time: string, client: Client) {
    const slotTherapyAppointment = getSlotTherapyAppointment(time, client.therapy_appointments || []);

    if (slotTherapyAppointment) {
      return slotTherapyAppointment.therapy_type;
    }
    return '';
  }

  function clickSlot(event: React.MouseEvent, client: Client, time: string) {
    if (event.shiftKey) {
      const slotTherapyAppointment = getSlotTherapyAppointment(time, client.therapy_appointments || []);

      onShiftClick?.(client, time, slotTherapyAppointment);
      return;
    }

    const slotAppointment = getSlotAppointment(time, client.appointments || []);
    const slotAvailability = getSlotAvailability(time, client.availabilities || []);
    const slotBlock = getSlotBlock(time);

    if (slotAppointment && slotBlock) {
      onClickAppointmentSlot?.(client, slotBlock, slotAppointment, slotAvailability);
      return;
    }
    if (slotAvailability && slotBlock) {
      onClickAvailabilitySlot?.(client, slotBlock, slotAvailability);
      return;
    }
    if (slotBlock) {
      onClickBlockSlot?.(client, slotBlock);
      return;
    }
  }

  function renderSlotCorner(slotAppointment: Appointment | undefined) {
    const cornerText = slotAppointment && slotAppointment.is_preschool_or_adaptive ? 'PA' : '';
    if (cornerText) {
      return <div className="TimeSlotTable__slot__corner">{cornerText}</div>;
    }
    return null;
  }

  function renderTimeSlot(time: string, client: Client) {
    const slotAppointment = getSlotAppointment(time, client.appointments || []);

    if (slotAppointment) {
      const hoverTrigger = (
        <td
          className="TimeSlotTable__slot"
          style={{
            borderLeft: isOnTheHour(time) ? '2px solid black' : undefined,
            background: slotBackground(time, client),
          }}
          onClick={(event) => {
            clickSlot(event, client, time);
          }}
        >
          {renderSlotCorner(slotAppointment)}
          {slotText(time, client)}
        </td>
      );

      if (user?.hover_cards_enabled) {
        return (
          <HoverCard key={time}>
            <HoverCardTrigger asChild>{hoverTrigger}</HoverCardTrigger>
            <HoverCardContent className="w-96">
              <AppointmentHover appointment={slotAppointment} />
            </HoverCardContent>
          </HoverCard>
        );
      } else {
        return hoverTrigger;
      }
    }

    return (
      <td
        key={time}
        className="TimeSlotTable__slot"
        style={{
          borderLeft: isOnTheHour(time) ? '2px solid black' : undefined,
          background: slotBackground(time, client),
        }}
        onClick={(event) => {
          clickSlot(event, client, time);
        }}
      >
        {slotText(time, client)}
      </td>
    );
  }

  return (
    <table className="TimeSlotTable">
      <colgroup>
        <col />
        {timeSlots.map((slot) => (
          <col key={slot} width="28px" />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th title="Client"></th>
          <th title="Skill level requirement"></th>
          <th title="Spanish speaker">Spa</th>
          <th title="Day hours">{dayToString(day, 'medium')}</th>
          <th title="Week hours">Week</th>
          <th title="Hours prescribed">Rx</th>
          <th title="Available"></th>
          {timeSlots.map((slot) => (
            <th
              key={slot}
              style={{
                borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                background: getSlotBlock(slot) ? 'white' : '#404040',
                color: getSlotBlock(slot) ? 'black' : 'white',
                fontWeight: isOnTheHour(slot) ? 'bold' : 'light',
              }}
            >
              {formatTimeTimeline(slot)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td className="text-nowrap">
              <a
                className="cursor-pointer"
                onClick={() => {
                  onClickClient?.(client);
                }}
              >
                {client.first_name} {client.last_name}
              </a>
            </td>
            <td style={{ background: skillLevelColor(client.req_skill_level), textAlign: 'center' }}>
              {client.req_skill_level}
            </td>
            <td
              style={{
                textAlign: 'center',
                verticalAlign: 'middle',
              }}
            >
              {client.req_spanish_speaking && (
                <span className="material-symbols-outlined block text-sm text-green-700">check</span>
              )}
            </td>
            <td style={{ textAlign: 'center' }}>{client.computed_properties?.total_hours_by_day[day]}</td>
            <td style={{ textAlign: 'center' }}>{client.computed_properties?.total_hours}</td>
            <td style={{ textAlign: 'center' }}>{client.prescribed_hours}</td>
            <td
              style={{
                background: 'black',
                color: client.computed_properties?.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {client.computed_properties?.is_maxed_on_sessions ? 'M' : 'A'}
            </td>
            {timeSlots.map((slot) => renderTimeSlot(slot, client))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
