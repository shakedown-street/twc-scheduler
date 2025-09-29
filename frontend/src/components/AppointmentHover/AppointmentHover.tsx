import { AppointmentModel } from '@/api';
import { dayToString, formatTime } from '@/utils/time';
import { ArrowLeftRight, Calendar, CircleCheck, CircleX, GraduationCap, MapPin, NotebookPen, User } from 'lucide-react';
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
  }, [appointment]);

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
        <Label>
          <MapPin size="16" /> In clinic:
        </Label>
        {appointment.in_clinic ? (
          <CircleCheck className="text-green-700" size="16" />
        ) : (
          <CircleX className="text-red-700" size="16" />
        )}
      </div>
      <div className="AppointmentHover__row">
        <Label>
          <GraduationCap size="16" /> Preschool/adaptive:
        </Label>
        {appointment.is_preschool_or_adaptive ? (
          <CircleCheck className="text-green-700" size="16" />
        ) : (
          <CircleX className="text-red-700" size="16" />
        )}
      </div>
      {appointment.client?.notes && (
        <div className="AppointmentHover__row AppointmentHover__row--notes">
          <Label>
            <NotebookPen size="16" /> Client notes:
          </Label>
          <div className="AppointmentHover__notes">{appointment.client?.notes}</div>
        </div>
      )}
      {appointment.notes && (
        <div className="AppointmentHover__row AppointmentHover__row--notes">
          <Label>
            <NotebookPen size="16" /> Appointment notes:
          </Label>
          <div className="AppointmentHover__notes">{appointment.notes}</div>
        </div>
      )}
      {recommendedSubs.length > 0 && (
        <div className="AppointmentHover__row AppointmentHover__row--recommendedSubs">
          <Label>
            <ArrowLeftRight size="16" /> Recommended subs:
          </Label>
          <div className="flex flex-wrap gap-1">
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
