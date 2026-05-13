import bcrypt from 'bcryptjs';
import dbConnect from './lib/db';
import { User } from './models/User';
import { Delivery } from './models/Delivery';
import { Collection } from './models/Collection';
import { JobCard } from './models/JobCard';
import { Workshop } from './models/Workshop';
import { FuelManagement } from './models/FuelManagement';

async function seed() {
  try {
    await dbConnect();

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@test.com' });

    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      // Create admin user with specified credentials
      const hashedPassword = await bcrypt.hash('123456', 12);

      await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
      });

      console.log('Admin user created successfully!');
      console.log('Email: admin@test.com');
      console.log('Password: 123456');
      console.log('Role: admin');
    }

    // Check if a technician exists and create sample delivery and collection
    const techExists = await User.findOne({ role: 'technician' });

    if (!techExists) {
      const techPassword = await bcrypt.hash('tech123', 12);
      const technician = await User.create({
        name: 'John Doe',
        email: 'tech@test.com',
        password: techPassword,
        role: 'technician',
      });
      console.log('Sample technician created: tech@test.com / tech123');

      // Create a sample delivery
      await Delivery.create({
        date: new Date(),
        client: 'Sample Client Co.',
        location: '123 Main St, City',
        technician: technician._id,
        items: [
          { item: 'Widget A', quantity: 10 },
          { item: 'Widget B', quantity: 5 }
        ],
        receivedBy: 'John Doe',
        complete: false,
      });
      console.log('Sample delivery created for technician');

      // Create a sample collection
      await Collection.create({
        date: new Date(),
        supplier: 'Sample Supplier Ltd.',
        location: '456 Warehouse Ave',
        technician: technician._id,
        vehicle: 'Van 2',
        items: [
          { item: 'Component X', quantity: 20 },
          { item: 'Component Y', quantity: 15 }
        ],
        client: 'End Customer Inc.',
      });
      console.log('Sample collection created for technician');

      // Create a sample job card
      await JobCard.create({
        date: new Date(),
        clientCompany: 'Acme Corp',
        clientName: 'Jane Smith',
        faultDescription: 'Laptop screen cracked, not displaying anything',
        scopeOfWork: 'Replace LCD screen and test display output',
        workCarriedOut: 'Replaced the cracked LCD panel with a new one, tested display output, confirmed working',
        timeIn: '09:00',
        timeOut: '11:30',
        technician: technician._id,
        complete: false,
      });
       console.log('Sample job card created for technician');

      // Create a sample workshop item
      await Workshop.create({
        client: 'Acme Corp',
        itemBookedIn: 'Dell Laptop XPS 15',
        specs: 'Intel i7, 16GB RAM, 512GB SSD, 4K Touchscreen',
        faultOfItem: 'Battery not charging, laptop only works when plugged in',
        workScope: 'Replace battery and test charging circuit',
        technician: technician._id,
        complete: false,
      });
       console.log('Sample workshop item created for technician');

      // Create a sample fuel record
      await FuelManagement.create({
        date: new Date(),
        vehicle: 'Toyota Hilux',
        mileage: 125000,
        amountFilled: 1500,
        litresFilled: 50,
        garage: 'Shell City Centre',
        kmDone: 500,
        technician: technician._id,
        complete: false,
      });
      console.log('Sample fuel record created for technician');
    } else {
      console.log('Technician user already exists, skipping sample data creation');
    }

  } catch (error) {
    console.error('Seed error:', error);
  }
}

seed();
