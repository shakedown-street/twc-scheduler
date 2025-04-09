import React from 'react';
import { BlockModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { formatTimeTimeline, generateTimeSlots, isBetweenInclusiveStart, isOnTheHour } from '~/utils/time';
import './TimeSlotTable.scss';
import { RadixHoverCard } from '~/ui/RadixHoverCard/RadixHoverCard';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';

export type TimeSlotTableProps = {
  clients: Client[];
  day: number;
  onClickBlockSlot?: (client: Client, block: Block) => void;
  onClickAvailabilitySlot: (client: Client, availability: Availability, block: Block | undefined) => void;
  onClickAppointmentSlot?: (
    client: Client,
    appointment: Appointment,
    availability: Availability | undefined,
    block: Block | undefined
  ) => void;
};

export const TimeSlotTable = ({
  clients,
  day,
  onClickBlockSlot,
  onClickAvailabilitySlot,
  onClickAppointmentSlot,
}: TimeSlotTableProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [timeSlots, setTimeSlots] = React.useState<string[]>([]);

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
      setTimeSlots(generateTimeSlots(blocks[0].start_time, blocks[blocks.length - 1].end_time, 15));
    });
  }, []);

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

  function slotBackground(time: string, client: Client) {
    const slotAppointment = getSlotAppointment(time, client.appointments || []);
    const slotAvailability = getSlotAvailability(time, client.availabilities || []);
    const slotBlock = getSlotBlock(time);

    if (slotAppointment) {
      if (slotAppointment.in_clinic) {
        const bgColor = slotAppointment.technician?.bg_color || 'white';
        const textColor = slotAppointment.technician?.text_color || 'black';
        return `repeating-linear-gradient(45deg, ${textColor}, ${textColor} 4px, ${bgColor} 4px, ${bgColor} 8px)`;
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

  function clickSlot(client: Client, time: string) {
    const slotAppointment = getSlotAppointment(time, client.appointments || []);
    const slotAvailability = getSlotAvailability(time, client.availabilities || []);
    const slotBlock = getSlotBlock(time);

    if (slotAppointment) {
      onClickAppointmentSlot?.(client, slotAppointment, slotAvailability, slotBlock);
      return;
    }
    if (slotAvailability) {
      onClickAvailabilitySlot?.(client, slotAvailability, slotBlock);
      return;
    }
    if (slotBlock) {
      onClickBlockSlot?.(client, slotBlock);
      return;
    }
  }

  return (
    <table className="TimeSlotTable">
      <thead>
        <tr>
          <th>Client</th>
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
            <td>
              {client.first_name} {client.last_name}
            </td>
            {timeSlots.map((slot) => {
              const slotAppointment = getSlotAppointment(slot, client.appointments || []);

              if (slotAppointment) {
                return (
                  <RadixHoverCard
                    key={slot}
                    portal
                    trigger={
                      <td
                        className="TimeSlotTable__slot"
                        style={{
                          borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                          background: slotBackground(slot, client),
                        }}
                        onClick={() => {
                          clickSlot(client, slot);
                        }}
                      ></td>
                    }
                  >
                    <AppointmentHover appointment={slotAppointment} />
                  </RadixHoverCard>
                );
              }

              return (
                <td
                  key={slot}
                  className="TimeSlotTable__slot"
                  style={{
                    borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                    background: slotBackground(slot, client),
                  }}
                  onClick={() => {
                    clickSlot(client, slot);
                  }}
                ></td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
