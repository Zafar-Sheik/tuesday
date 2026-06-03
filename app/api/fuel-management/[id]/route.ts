import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { FuelManagement } from '@/models/FuelManagement';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    await dbConnect();

    const fuelRecord = await FuelManagement.findById(id);

    if (!fuelRecord) {
      return NextResponse.json(
        { success: false, error: 'Fuel record not found' },
        { status: 404 }
      );
    }

    // All roles can edit any fuel record
    if (date) fuelRecord.date = new Date(date);
    if (vehicle) fuelRecord.vehicle = vehicle;
    if (mileage !== undefined) fuelRecord.mileage = mileage;
    if (amountFilled !== undefined) fuelRecord.amountFilled = amountFilled;
    if (litresFilled !== undefined) fuelRecord.litresFilled = litresFilled;
    if (garage) fuelRecord.garage = garage;
    if (kmDone !== undefined) fuelRecord.kmDone = kmDone;
    if (image !== undefined) fuelRecord.image = image;
    if (complete !== undefined) fuelRecord.complete = complete;
    if (technician) fuelRecord.technician = technician;

    await fuelRecord.save();

    const populatedFuelRecord = await FuelManagement.findById(id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedFuelRecord,
    });
  } catch (error) {
    console.error('Update fuel record error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const fuelRecord = await FuelManagement.findById(id);

    if (!fuelRecord) {
      return NextResponse.json(
        { success: false, error: 'Fuel record not found' },
        { status: 404 }
      );
    }

    // All roles can delete any fuel record
    await FuelManagement.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Delete fuel record error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}