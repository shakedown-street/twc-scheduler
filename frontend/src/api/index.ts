import { BaseModel } from '@/lib/http';

export const AppointmentModel = new BaseModel<Appointment>('/api/appointments/');
export const AvailabilityModel = new BaseModel<Availability>('/api/availabilities/');
export const BlockModel = new BaseModel<Block>('/api/blocks/');
export const ClientModel = new BaseModel<Client>('/api/clients/');
export const ScheduleModel = new BaseModel<Schedule>('/api/schedules/');
export const TechnicianModel = new BaseModel<Technician>('/api/technicians/');
export const TherapyAppointmentModel = new BaseModel<TherapyAppointment>('/api/therapy-appointments/');
export const UserModel = new BaseModel<User>('/api/users/');
