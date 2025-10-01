import { AppointmentModel } from '@/api';
import { cn } from '@/lib/utils';
import { dayToString, formatTime } from '@/utils/time';
import { ArrowLeftRight, Calendar, CircleCheck, CircleX, GraduationCap, MapPin, NotebookPen, User } from 'lucide-react';
import React from 'react';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

const AppointmentHoverRow = ({ children, className }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 py-2 text-sm not-last:border-b first-of-type:pt-0 last-of-type:pb-0',
        className,
      )}
    >
      {children}
    </div>
  );
};

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
      <AppointmentHoverRow>
        <Label>
          <User size="16" /> Client:
        </Label>
        <Badge>
          {appointment.client?.first_name} {appointment.client?.last_name}
        </Badge>
      </AppointmentHoverRow>
      <AppointmentHoverRow>
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
      </AppointmentHoverRow>
      <AppointmentHoverRow>
        <Label>
          <Calendar size="16" /> Time:
        </Label>
        <div>
          {dayToString(appointment.day, 'medium')} from {formatTime(appointment.start_time)} to{' '}
          {formatTime(appointment.end_time)}
        </div>
      </AppointmentHoverRow>
      <AppointmentHoverRow>
        <Label>
          <MapPin size="16" /> In clinic:
        </Label>
        {appointment.in_clinic ? (
          <CircleCheck className="text-green-700" size="16" />
        ) : (
          <CircleX className="text-red-700" size="16" />
        )}
      </AppointmentHoverRow>
      <AppointmentHoverRow>
        <Label>
          <GraduationCap size="16" /> Preschool/adaptive:
        </Label>
        {appointment.is_preschool_or_adaptive ? (
          <CircleCheck className="text-green-700" size="16" />
        ) : (
          <CircleX className="text-red-700" size="16" />
        )}
      </AppointmentHoverRow>
      {appointment.client?.notes && (
        <AppointmentHoverRow className="flex-col items-start">
          <Label>
            <NotebookPen size="16" /> Client notes:
          </Label>
          <div className="bg-muted text-muted-foreground max-h-16 w-full overflow-y-auto p-2 text-xs whitespace-pre-wrap">
            {appointment.client?.notes}
          </div>
        </AppointmentHoverRow>
      )}
      {appointment.notes && (
        <AppointmentHoverRow className="flex-col items-start">
          <Label>
            <NotebookPen size="16" /> Appointment notes:
          </Label>
          <div className="bg-muted text-muted-foreground max-h-16 w-full overflow-y-auto p-2 text-xs whitespace-pre-wrap">
            {appointment.notes}
          </div>
        </AppointmentHoverRow>
      )}
      {recommendedSubs.length > 0 && (
        <AppointmentHoverRow className="flex-col items-start">
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
        </AppointmentHoverRow>
      )}
    </div>
  );
};
