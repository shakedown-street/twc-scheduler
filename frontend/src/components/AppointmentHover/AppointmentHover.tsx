import { Appointment } from '~/types/Appointment';
import { dayToString, formatTime } from '~/utils/time';
import './AppointmentHover.scss';
import { Badge } from '~/ui';
import clsx from 'clsx';

export type AppointmentHoverProps = {
  appointment: Appointment;
};

export const AppointmentHover = ({ appointment }: AppointmentHoverProps) => {
  return (
    <div className="AppointmentHover">
      <div className="AppointmentHover__row">
        <label>
          <span className="material-symbols-outlined">person</span> Client:
        </label>
        <Badge radius="sm" size="sm">
          {appointment.client?.first_name} {appointment.client?.last_name}
        </Badge>
      </div>
      <div className="AppointmentHover__row">
        <label>
          <span className="material-symbols-outlined">engineering</span> Technician:
        </label>
        <Badge
          radius="sm"
          size="sm"
          style={{
            background: appointment.technician?.color,
          }}
        >
          {appointment.technician?.first_name} {appointment.technician?.last_name}
        </Badge>
      </div>
      <div className="AppointmentHover__row">
        <label>
          <span className="material-symbols-outlined">calendar_today</span> Time:
        </label>
        <div>
          {dayToString(appointment.day, 'medium')} from {formatTime(appointment.start_time)} to{' '}
          {formatTime(appointment.end_time)}
        </div>
      </div>
      <div className="AppointmentHover__row">
        <label>
          <span className="material-symbols-outlined">location_on</span> In clinic:
        </label>
        <span
          className={clsx('material-symbols-outlined', 'AppointmentHover__inClinic', {
            'AppointmentHover__inClinic--true': appointment.in_clinic,
            'AppointmentHover__inClinic--false': !appointment.in_clinic,
          })}
        >
          {appointment.in_clinic ? 'check_circle' : 'cancel'}
        </span>
      </div>
      {appointment.notes && (
        <div className="AppointmentHover__row AppointmentHover__row--notes">
          <div className="AppointmentHover__notes">{appointment.notes}</div>
        </div>
      )}
    </div>
  );
};
