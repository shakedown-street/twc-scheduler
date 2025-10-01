import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { skillLevelColor, striped } from '@/utils/color';
import { hours, hoursByDay, isMaxedOnSessions } from '@/utils/computedProperties';
import {
  addMinutes,
  dayToString,
  formatTimeTimeline,
  generateTimeSlots,
  isBetweenInclusiveStart,
  isOnTheHour,
  removeMinutes,
} from '@/utils/time';
import { Check } from 'lucide-react';
import React from 'react';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';

const TableHeader = ({ children, className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th className={cn('border border-black p-1 text-left text-[10px] select-none', className)} {...props}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td className={cn('border border-black p-1 text-center text-xs select-none', className)} {...props}>
      {children}
    </td>
  );
};

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
        const bgColor = slotAppointment.technician?.bg_color || 'var(--background)';
        const textColor = slotAppointment.technician?.text_color || 'var(--foreground)';
        return striped(textColor, bgColor);
      }
      return slotAppointment.technician?.bg_color || 'var(--background)';
    }
    if (slotAvailability) {
      return '#cbd5e1'; // tw-slate-300
    }
    if (slotBlock) {
      return 'var(--background)';
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
      return (
        <div className="absolute top-0 right-0 bg-black p-0.5 text-[8px] leading-none text-white">{cornerText}</div>
      );
    }
    return null;
  }

  function renderTimeSlot(time: string, client: Client) {
    const slotAppointment = getSlotAppointment(time, client.appointments || []);

    if (slotAppointment) {
      const hoverTrigger = (
        <TableCell
          className="relative w-8 text-center font-bold text-white uppercase"
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
        </TableCell>
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
      <TableCell
        key={time}
        className="relative w-8 text-center font-bold text-white uppercase"
        style={{
          borderLeft: isOnTheHour(time) ? '2px solid black' : undefined,
          background: slotBackground(time, client),
        }}
        onClick={(event) => {
          clickSlot(event, client, time);
        }}
      >
        {slotText(time, client)}
      </TableCell>
    );
  }

  return (
    <table className="w-full border-collapse">
      <colgroup>
        <col />
        {timeSlots.map((slot) => (
          <col key={slot} width="28px" />
        ))}
      </colgroup>
      <thead>
        <tr>
          <TableHeader title="Client"></TableHeader>
          <TableHeader title="Skill level requirement"></TableHeader>
          <TableHeader title="Spanish speaker">Spa</TableHeader>
          <TableHeader title="Day hours">{dayToString(day, 'medium')}</TableHeader>
          <TableHeader title="Week hours">Week</TableHeader>
          <TableHeader title="Hours prescribed">Rx</TableHeader>
          <TableHeader title="Available"></TableHeader>
          {timeSlots.map((slot) => (
            <TableHeader
              key={slot}
              style={{
                borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                background: getSlotBlock(slot) ? 'var(--background)' : '#404040',
                color: getSlotBlock(slot) ? 'var(--foreground)' : 'white',
                fontWeight: isOnTheHour(slot) ? 'bold' : 'light',
              }}
            >
              {formatTimeTimeline(slot)}
            </TableHeader>
          ))}
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id} className="hover:bg-border">
            <TableCell className="text-nowrap">
              <a
                className="text-primary cursor-pointer"
                onClick={() => {
                  onClickClient?.(client);
                }}
              >
                {client.first_name} {client.last_name}
              </a>
            </TableCell>
            <TableCell
              className="text-center text-black"
              style={{ background: skillLevelColor(client.req_skill_level) }}
            >
              {client.req_skill_level}
            </TableCell>
            <TableCell className="text-center align-middle">
              {client.req_spanish_speaking && <Check className="text-green-700" size="14" />}
            </TableCell>
            <TableCell className="text-center">{hoursByDay(client, day)}</TableCell>
            <TableCell className="text-center">{hours(client)}</TableCell>
            <TableCell className="text-center">{client.prescribed_hours}</TableCell>
            <TableCell
              className={cn('bg-black text-center font-bold', {
                'text-red-500': isMaxedOnSessions(client),
                'text-green-500': !isMaxedOnSessions(client),
              })}
            >
              {isMaxedOnSessions(client) ? 'M' : 'A'}
            </TableCell>
            {timeSlots.map((slot) => renderTimeSlot(slot, client))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
