type WithAvailabilities = {
  availabilities?: { duration: number }[];
};

type WithAppointments = {
  appointments?: { day: number; duration: number }[];
};

export function availableHours(obj: WithAvailabilities) {
  return obj.availabilities!.reduce((sum, availability) => sum + Math.round(availability.duration / 60), 0);
}

export function hoursByDay(obj: WithAppointments, day: number) {
  return obj
    .appointments!.filter((appointment) => appointment.day === day)
    .reduce((sum, appointment) => sum + Math.round(appointment.duration / 60), 0);
}

export function hours(obj: WithAppointments) {
  return obj.appointments!.reduce((sum, appointment) => sum + Math.round(appointment.duration / 60), 0);
}

export function isMaxedOnSessions(obj: Client | Technician) {
  if ('prescribed_hours' in obj) {
    return hours(obj) >= obj.prescribed_hours;
  } else if ('requested_hours' in obj) {
    return hours(obj) >= obj.requested_hours;
  }
}
