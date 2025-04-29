import React from 'react';
import { TechnicianModel } from '~/api';
import { Appointment } from '~/types/Appointment';
import { Availability } from '~/types/Availability';
import { Technician } from '~/types/Technician';
import { Spinner } from '~/ui';
import { orderByFirstName } from '~/utils/order';

// Not in use ATM

export type TechniciansContextType = {
  technicians: Technician[];
  addTechnician: (technician: Technician) => void;
  updateTechnician: (technician: Technician) => void;
  removeTechnician: (technician: Technician) => void;
  addTechnicianAvailability: (availability: Availability) => void;
  updateTechnicianAvailability: (availability: Availability) => void;
  removeTechnicianAvailability: (availability: Availability) => void;
  addTechnicianAppointment: (appointment: Appointment) => void;
  updateTechnicianAppointment: (appointment: Appointment) => void;
  removeTechnicianAppointment: (appointment: Appointment) => void;
};

export const TechniciansContext = React.createContext<TechniciansContextType | undefined>(undefined);

export type TechniciansProviderProps = {
  children: React.ReactNode;
};

export const TechniciansProvider = (props: TechniciansProviderProps) => {
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    TechnicianModel.all({
      page_size: 1000,
      expand_availabilities: true,
      expand_appointments: true,
    })
      .then((technicians) => {
        setTechnicians(orderByFirstName<Technician>(technicians));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function addTechnician(technician: Technician) {
    setTechnicians((prev) => {
      return [...prev, technician].sort((a, b) => a.first_name.localeCompare(b.first_name));
    });
  }

  function updateTechnician(technician: Technician) {
    setTechnicians(technicians.map((c) => (c.id === technician.id ? Object.assign({}, c, technician) : c)));
  }

  function removeTechnician(technician: Technician) {
    setTechnicians(technicians.filter((c) => c.id !== technician.id));
  }

  function addTechnicianAvailability(availability: Availability) {
    setTechnicians((prev) =>
      prev.map((c) => {
        if (c.id === availability.object_id) {
          c.availabilities = [...(c.availabilities || []), availability];
          return c;
        }
        return c;
      })
    );
  }

  function updateTechnicianAvailability(availability: Availability) {
    setTechnicians((prev) =>
      prev.map((c) => {
        if (c.id === availability.object_id) {
          c.availabilities = c.availabilities?.map((a) => (a.id === availability.id ? availability : a));
          return c;
        }
        return c;
      })
    );
  }

  function removeTechnicianAvailability(availability: Availability) {
    setTechnicians((prev) =>
      prev.map((c) => {
        c.availabilities = c.availabilities?.filter((a) => a.id !== availability.id);
        return c;
      })
    );
  }

  function addTechnicianAppointment(appointment: Appointment) {
    setTechnicians((prev) =>
      prev.map((c) => {
        if (c.id === appointment.technician?.id) {
          c.appointments = [...(c.appointments || []), appointment];
          return c;
        }
        return c;
      })
    );
  }

  function updateTechnicianAppointment(appointment: Appointment) {
    setTechnicians((prev) =>
      prev.map((c) => {
        if (c.id === appointment.technician?.id) {
          c.appointments = c.appointments?.map((a) => (a.id === appointment.id ? appointment : a));
          return c;
        }
        return c;
      })
    );
  }

  function removeTechnicianAppointment(appointment: Appointment) {
    setTechnicians((prev) =>
      prev.map((c) => {
        c.appointments = c.appointments?.filter((a) => a.id !== appointment.id);
        return c;
      })
    );
  }

  if (loading) {
    return <Spinner className="mt-8" message="Loading technicians..." />;
  }

  return (
    <TechniciansContext.Provider
      value={{
        technicians,
        addTechnician,
        updateTechnician,
        removeTechnician,
        addTechnicianAvailability,
        updateTechnicianAvailability,
        removeTechnicianAvailability,
        addTechnicianAppointment,
        updateTechnicianAppointment,
        removeTechnicianAppointment,
      }}
    >
      {props.children}
    </TechniciansContext.Provider>
  );
};

export const useTechnicians = () => {
  const context = React.useContext(TechniciansContext);

  if (context === undefined) {
    throw new Error('useTechnicians must be used within an TechniciansProvider');
  }

  return context;
};
