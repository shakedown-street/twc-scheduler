import { Appointment } from '~/types/Appointment';

export type AppointmentHoverProps = {
  appointment: Appointment;
};

export const AppointmentHover = ({ appointment }: AppointmentHoverProps) => {
  return (
    <>
      <p>
        Client: {appointment.client?.first_name} {appointment.client?.last_name}
      </p>
      <p>Start time: {appointment.start_time}</p>
      <p>End time: {appointment.end_time}</p>
      <p>In clinic: {appointment.in_clinic}</p>
      <p>
        Technician: {appointment.technician?.first_name} {appointment.technician?.last_name}
      </p>
      <p>Notes</p>
      <p className="text-pre-wrap">{appointment.notes}</p>
    </>
  );
};
