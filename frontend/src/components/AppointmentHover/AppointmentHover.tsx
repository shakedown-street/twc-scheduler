import { AppointmentModel } from '@/api';
import { dayToString, formatTime } from '@/utils/time';
import clsx from 'clsx';
import { Calendar, User } from 'lucide-react';
import React from 'react';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
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
    <div className="flex flex-col">
      <div className="AppointmentHover__row">
        <Label>
          <User size="16" /> Client:
        </Label>
        <Badge>
          {appointment.client?.first_name} {appointment.client?.last_name}
        </Badge>
      </div>
      <div className="AppointmentHover__row">
        <Label>
          <User size="16" /> Technician:
        </Label>
        <Badge
          style={{
            background: appointment.technician?.bg_color,
            color: appointment.technician?.text_color,
          }}
        >
          {appointment.technician?.first_name} {appointment.technician?.last_name}
        </Badge>
      </div>
      <div className="AppointmentHover__row">
        <Label>
          <Calendar size="16" /> Time:
        </Label>
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
      <div className="AppointmentHover__row">
        <label>
          <span className="material-symbols-outlined">school</span> Preschool/Adaptive:
        </label>
        <span
          className={clsx('material-symbols-outlined', 'AppointmentHover__inClinic', {
            'AppointmentHover__inClinic--true': appointment.is_preschool_or_adaptive,
            'AppointmentHover__inClinic--false': !appointment.is_preschool_or_adaptive,
          })}
        >
          {appointment.is_preschool_or_adaptive ? 'check_circle' : 'cancel'}
        </span>
      </div>
      {appointment.client?.notes && (
        <div className="AppointmentHover__row AppointmentHover__row--notes">
          <label>
            <span className="material-symbols-outlined">note</span> Client notes:
          </label>
          <div className="AppointmentHover__notes">{appointment.client?.notes}</div>
        </div>
      )}
      {appointment.notes && (
        <div className="AppointmentHover__row AppointmentHover__row--notes">
          <label>
            <span className="material-symbols-outlined">note</span> Appointment notes:
          </label>
          <div className="AppointmentHover__notes">{appointment.notes}</div>
        </div>
      )}
      {recommendedSubs.length > 0 && (
        <div className="AppointmentHover__row AppointmentHover__row--recommendedSubs">
          <label>
            <span className="material-symbols-outlined">swap_horiz</span> Recommended subs:
          </label>
          <div className="AppointmentHover__recommendedSubs">
            {recommendedSubs.map((sub) => (
              <Badge
                key={sub.id}
                style={{
                  background: sub.bg_color,
                  color: sub.text_color,
                }}
              >
                {sub.first_name} {sub.last_name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
