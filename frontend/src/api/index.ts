import { BaseModel } from '~/http';
import { User } from '~/types/User';

export const UserModel = new BaseModel<User>('/api/users/');
export const CheckoutSessionModel = new BaseModel<any>('/api/checkout-sessions/');
export const BillingSessionModel = new BaseModel<any>('/api/billing-sessions/');
