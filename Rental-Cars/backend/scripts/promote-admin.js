import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/users?authSource=admin';

async function promote(mail) {
  if (!mail) {
    console.error('Uso: node scripts/promote-admin.js <mail>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const usersColl = db.collection('users');

    const res = await usersColl.findOneAndUpdate(
      { mail },
      { $set: { role: 'admin' } },
      { returnDocument: 'after' }
    );

    if (!res) { 
      console.error(`Usuario con mail="${mail}" no encontrado.`);
      process.exit(2);
    }

    console.log('Usuario promovido a admin:');
    console.log(res);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(3);
  }
}

promote(process.argv[2]);