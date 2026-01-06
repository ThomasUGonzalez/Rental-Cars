export interface User {
  id: string;
  mail: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}