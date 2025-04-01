import React from 'react';
import { BlockModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { formatTimeTimeline, isBetweenInclusiveStart, isOnTheHour } from '~/utils/time';
import './TimeSlotTable.scss';

export type TimeSlotTableProps = {
  clients: Client[];
  day: number;
  onClickBlockSlot: (args: { client: Client; block: Block }) => void;
  onDeleteAppointment?: (appointment: Appointment) => void;
};

export const TimeSlotTable = ({ clients, day, onClickBlockSlot, onDeleteAppointment }: TimeSlotTableProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [timeSlots, setTimeSlots] = React.useState<string[]>([]);

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
      setTimeSlots(generateTimeSlots(blocks[0].start_time, blocks[blocks.length - 1].end_time, 15));
    });
  }, []);

  function generateTimeSlots(startTime: string, endTime: string, interval: number) {
    const timeSlots: string[] = [];
    let currentTime = startTime;
    while (currentTime < endTime) {
      timeSlots.push(currentTime);
      let [hours, minutes, seconds] = currentTime.split(':').map(Number);
      minutes += interval;
      if (minutes >= 60) {
        hours += 1;
        minutes -= 60;
      }
      currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0'
      )}`;
    }
    return timeSlots;
  }

  function isSlotBlock(time: string) {
    return blocks.some((block) => {
      return isBetweenInclusiveStart(time, block.start_time, block.end_time);
    });
  }

  function isSlotAvailable(time: string, client: Client) {
    return client.availabilities
      ?.filter((a) => a.day === day)
      .some((availability) => {
        const block = blocks.find(
          (block) => block.start_time === availability.start_time && block.end_time === availability.end_time
        );
        if (!block) {
          return false;
        }
        return isBetweenInclusiveStart(time, block.start_time, block.end_time);
      });
  }

  function isSlotAppointment(time: string, appointments: Appointment[]) {
    return appointments
      .filter((a) => a.day === day)
      .some((appointment) => {
        return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
      });
  }

  function slotColor(time: string, client: Client) {
    if (isSlotAppointment(time, client.appointments || [])) {
      const appointment = client.appointments
        ?.filter((a) => a.day === day)
        .find((appointment) => {
          return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
        });
      return appointment?.technician_color || 'white';
    }
    if (isSlotAvailable(time, client)) {
      return 'lightgray';
    }
    if (isSlotBlock(time)) {
      return 'white';
    }
    return 'gray';
  }

  function clickSlot(client: Client, time: string) {
    if (isSlotAppointment(time, client.appointments || [])) {
      const appointment = client.appointments
        ?.filter((a) => a.day === day)
        .find((appointment) => {
          return isBetweenInclusiveStart(time, appointment.start_time, appointment.end_time);
        });
      if (!appointment) {
        return;
      }

      onDeleteAppointment?.(appointment);
      return;
    }
    if (isSlotBlock(time)) {
      const block = blocks.find((block) => isBetweenInclusiveStart(time, block.start_time, block.end_time));
      if (!block) {
        return;
      }
      onClickBlockSlot?.({ client, block });
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
                backgroundColor: isSlotBlock(slot) ? 'white' : 'gray',
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
            {timeSlots.map((slot) => (
              <td
                key={slot}
                className="TimeSlotTable__slot"
                style={{
                  borderLeft: isOnTheHour(slot) ? '2px solid black' : undefined,
                  backgroundColor: slotColor(slot, client),
                }}
                onClick={() => {
                  clickSlot(client, slot);
                }}
              ></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
