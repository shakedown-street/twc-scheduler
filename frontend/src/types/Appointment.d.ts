export type Appointment = {
  id: string;
  created_at: string;
  updated_at: string;
  day: number;
  start_time: string;
  end_time: string;
  in_clinic: boolean;
  notes: string;
  client: string;
  technician: string;

  // Sometimes available
  technician_color?: string;
};
