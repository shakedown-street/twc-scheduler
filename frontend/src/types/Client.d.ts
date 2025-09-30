type Client = {
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
  past_technicians: Technician[];
  is_manually_maxed_out?: boolean;

  // Sometimes available
  appointments?: Appointment[];
  therapy_appointments?: TherapyAppointment[];
  availabilities?: Availability[];
  current_technicians?: Technician[];
};
