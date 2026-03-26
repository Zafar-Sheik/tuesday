import bcrypt from 'bcryptjs';
import dbConnect from './lib/db';
import { User } from './models/User';

async function seed() {
  try {
    await dbConnect();

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with specified credentials
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@test.com');
    console.log('Password: 123456');
    console.log('Role: admin');

  } catch (error) {
    console.error('Seed error:', error);
  }
}

seed();
