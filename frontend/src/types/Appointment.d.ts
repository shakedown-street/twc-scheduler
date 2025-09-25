type Appointment = {
  id: string;
  created_at: string;
  updated_at: string;
  day: number;
  start_time: string;
  end_time: string;
  in_clinic: boolean;
  is_preschool_or_adaptive: boolean;
  notes: string;

  // Sometimes available
  technician?: Technician;
  client?: Client;
};
