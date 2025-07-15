import { Appointment } from './Appointment';
import { Availability } from './Availability';
import { Technician } from './Technician';
import { TherapyAppointment } from './TherapyAppointment';

export type Client = {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  eval_done: boolean;
  is_onboarding: boolean;
  prescribed_hours: number;
  req_skill_level: number;
  req_spanish_speaking: boolean;
  notes: string;
  sub_notes: string;
  current_technicians: Technician[];
  past_technicians: Technician[];
  is_manually_maxed_out?: boolean;

  // Sometimes available
  appointments?: Appointment[];
  therapy_appointments?: TherapyAppointment[];
  availabilities?: Availability[];
  computed_properties?: {
    total_hours_available: number;
    total_hours: number;
    total_hours_by_day: number[];
    is_maxed_on_sessions: boolean;
  };
};
