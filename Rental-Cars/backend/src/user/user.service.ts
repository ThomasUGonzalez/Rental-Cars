import bcrypt from 'bcrypt';
import { IUser, User } from './user.entity.js';

export const register = async (mail: string, name: string, password: string): Promise<IUser> => {
  if (!password || password.length < 3) {
    throw new Error('La contraseña debe tener al menos 3 caracteres');
  }

  const existingUser = await User.findOne({ mail });
  if (existingUser) {
    throw new Error('El email ya está en uso');
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({ mail, name, passwordHash });
  return await user.save();
};

export const getUsers = async (): Promise<IUser[]> => {
  return await User.find({});
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

export const deleteUserById = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(id);
};

export const findUserByMail = async (mail: string): Promise<IUser | null> => {
  return await User.findOne({ mail });
};