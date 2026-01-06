import { Car } from './car';
import { User } from './user';

export interface Rental {
  id: number;
  user: User;
  car: Car;
  startDate: Date;
  endDate: Date;
  price: number;
}