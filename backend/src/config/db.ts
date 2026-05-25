import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || '';
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m[Database] MongoDB Connected: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[Database] Error: ${(error as Error).message}\x1b[0m`);
    process.exit(1);
  }
};

export default connectDB;
