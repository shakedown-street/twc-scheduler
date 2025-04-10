import { Appointment } from '~/types/Appointment';
import { Block } from '~/types/Block';
import { isBetweenInclusiveEnd, isBetweenInclusiveStart } from './time';
import { Availability } from '~/types/Availability';

export function getBlockAppointments(appointments: Appointment[], day: number, block: Block) {
  return appointments.filter((appointment) => {
    return (
      appointment.day === day &&
      isBetweenInclusiveStart(appointment.start_time, block.start_time, block.end_time) &&
      isBetweenInclusiveEnd(appointment.end_time, block.start_time, block.end_time)
    );
  });
}

export function getBlockAvailabilities(availabilities: Availability[], day: number, block: Block) {
  return availabilities.filter((availability) => {
    return (
      availability.day === day &&
      isBetweenInclusiveStart(availability.start_time, block.start_time, block.end_time) &&
      isBetweenInclusiveEnd(availability.end_time, block.start_time, block.end_time)
    );
  });
}

export function isFullBlock(availability: Availability, block: Block) {
  return availability.start_time === block.start_time && availability.end_time === block.end_time;
}
