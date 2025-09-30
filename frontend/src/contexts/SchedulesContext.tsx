/* eslint-disable react-refresh/only-export-components */

import { ScheduleModel } from '@/api';
import { Loader } from 'lucide-react';
import React from 'react';

export type SchedulesProviderContext = {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
};

export const SchedulesContext = React.createContext<SchedulesProviderContext | undefined>(undefined);

export type SchedulesProviderProps = {
  children: React.ReactNode;
};

export const SchedulesProvider = (props: SchedulesProviderProps) => {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    ScheduleModel.all()
      .then((schedules) => {
        setSchedules(schedules);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <SchedulesContext.Provider value={{ schedules, setSchedules }}>{props.children}</SchedulesContext.Provider>;
};

export const useSchedules = () => {
  const context = React.useContext(SchedulesContext);

  if (context === undefined) {
    throw new Error('useSchedules must be used within an useSchedulesProvider');
  }

  return context;
};
