import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { FuelManagement } from '@/models/FuelManagement';
import { requireRole } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // All users can see all fuel records (removed technician restriction)
    let query = {};

    const fuelRecords = await FuelManagement.find(query)
      .populate('technician', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: fuelRecords,
    });
  } catch (error) {
    console.error('Get fuel management error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      date,
      vehicle,
      mileage,
      amountFilled,
      litresFilled,
      garage,
      kmDone,
      image,
      complete,
      technician
    } = await request.json();

    if (!date || !vehicle || mileage === undefined || amountFilled === undefined || litresFilled === undefined || !garage || kmDone === undefined) {
      return NextResponse.json(
        { success: false, error: 'Date, vehicle, mileage, amount filled, litres filled, garage, and km done are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // All roles can specify any technician ID; if not provided, default to current user
    const technicianId = technician || user._id;

    const fuelRecord = await FuelManagement.create({
      date: new Date(date),
      vehicle,
      mileage,
      amountFilled,
      litresFilled,
      garage,
      kmDone,
      image,
      complete: complete || false,
      technician: technicianId,
    });

    const populatedFuelRecord = await FuelManagement.findById(fuelRecord._id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedFuelRecord,
    });
  } catch (error) {
    console.error('Create fuel record error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}