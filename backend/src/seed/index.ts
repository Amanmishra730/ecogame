import connectDB from '../config/database';
import { seedAll } from './seedData';

const runSeed = async () => {
  try {
    await connectDB();
    await seedAll();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
