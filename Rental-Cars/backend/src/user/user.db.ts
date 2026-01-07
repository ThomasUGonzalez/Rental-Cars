import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/users?authSource=admin';
await mongoose.connect(uri);

export const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
};