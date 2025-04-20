import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';
import { AppointmentModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Technician } from '~/types/Technician';
import { Badge } from '~/ui';
import { dayToString, formatTime } from '~/utils/time';
import './AppointmentHover.scss';

export type AppointmentHoverProps = {
  appointment: Appointment;
};

export const AppointmentHover = ({ appointment }: AppointmentHoverProps) => {
  const [recommendedSubs, setRecommendedSubs] = React.useState<Technician[]>([]);

  React.useEffect(() => {
    AppointmentModel.detailAction(appointment.id, 'find_recommended_subs', 'get').then((res) => {
      setRecommendedSubs(res.data);
    });
  }, []);

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
            background: appointment.technician?.bg_color,
            color: appointment.technician?.text_color,
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
      <div className="AppointmentHover__row AppointmentHover__row--recommendedSubs">
        <label>
          <span className="material-symbols-outlined">swap_horiz</span> Recommended Subs:
        </label>
        <div className="AppointmentHover__recommendedSubs">
          {recommendedSubs.length > 0 ? (
            recommendedSubs.map((sub) => (
              <Badge
                key={sub.id}
                radius="sm"
                size="sm"
                style={{
                  background: sub.bg_color,
                  color: sub.text_color,
                }}
              >
                {sub.first_name} {sub.last_name}
              </Badge>
            ))
          ) : (
            <div className="AppointmentHover__noRecommendedSubs">
              No automatic match found. Visit the <Link to="/sub-list">Sub List</Link> to find a sub.
            </div>
          )}
        </div>
      </div>
      {appointment.notes && (
        <div className="AppointmentHover__row AppointmentHover__row--notes">
          <div className="AppointmentHover__notes">{appointment.notes}</div>
        </div>
      )}
    </div>
  );
};
