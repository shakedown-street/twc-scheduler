/* eslint-disable react-refresh/only-export-components */

import { BlockModel, ClientModel, ScheduleModel, TechnicianModel } from '@/api';
import { orderByFirstName } from '@/utils/order';
import { Loader } from 'lucide-react';
import React from 'react';

export type ScheduleContextType = {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  fetchSchedule: () => Promise<void>;
};

export const ScheduleContext = React.createContext<ScheduleContextType | undefined>(undefined);

export type ScheduleProviderProps = {
  children: React.ReactNode;
};

export const ScheduleProvider = (props: ScheduleProviderProps) => {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Poll every minute
    const pollInterval = setInterval(() => {
      fetchSchedule();
    }, 60 * 1000);

    // Initial fetch
    fetchSchedule();

    return () => clearInterval(pollInterval);
  }, []);

  const fetchSchedules = async () => {
    await ScheduleModel.all().then((schedules) => {
      setSchedules(schedules);
    });
  };

  const fetchBlocks = async () => {
    await BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
  };

  const fetchClients = async () => {
    await ClientModel.all({
      page_size: 1000,
      expand_appointments: true,
      expand_availabilities: true,
    }).then((clients) => {
      setClients(orderByFirstName<Client>(clients));
    });
  };

  const fetchTechnicians = async () => {
    await TechnicianModel.all({
      page_size: 1000,
      expand_availabilities: true,
      expand_appointments: true,
    }).then((technicians) => {
      setTechnicians(orderByFirstName<Technician>(technicians));
    });
  };

  async function fetchSchedule() {
    await Promise.all([fetchSchedules(), fetchBlocks(), fetchClients(), fetchTechnicians()]).finally(() => {
      setLoading(false);
    });
  }

  if (loading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        setSchedules,
        blocks,
        setBlocks,
        clients,
        setClients,
        technicians,
        setTechnicians,
        fetchSchedule,
      }}
    >
      {props.children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = React.useContext(ScheduleContext);

  if (context === undefined) {
    throw new Error('useSchedule must be used within an ScheduleProvider');
  }

  return context;
};
