import { checkTimeIntersection } from './time';

export function getBlockAppointments(appointments: Appointment[], day: number, block: Block) {
  return appointments.filter((appointment) => {
    return (
      appointment.day === day &&
      checkTimeIntersection(appointment.start_time, appointment.end_time, block.start_time, block.end_time)
    );
  });
}

export function getBlockAvailabilities(availabilities: Availability[], day: number, block: Block) {
  return availabilities.filter((availability) => {
    return (
      availability.day === day &&
      checkTimeIntersection(availability.start_time, availability.end_time, block.start_time, block.end_time)
    );
  });
}

export function isFullBlock(availability: Availability, block: Block) {
  return availability.start_time === block.start_time && availability.end_time === block.end_time;
}
