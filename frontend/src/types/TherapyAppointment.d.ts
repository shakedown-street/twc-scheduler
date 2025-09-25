type TherapyAppointment = {
  id: string;
  created_at: string;
  updated_at: string;
  therapy_type: 'ot' | 'st' | 'mh';
  therapy_type_display: string;
  day: number;
  start_time: string;
  end_time: string;
  client: string;
  notes: string;
};
