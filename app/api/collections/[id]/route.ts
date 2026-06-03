import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection } from '@/models/Collection';
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
      supplier,
      location,
      technician,
      vehicle,
      items,
      client
    } = await request.json();

    await dbConnect();

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    // All roles can edit any collection
    if (date) collection.date = new Date(date);
    if (supplier) collection.supplier = supplier;
    if (location) collection.location = location;
    if (technician) collection.technician = technician;
    if (vehicle) collection.vehicle = vehicle;
    if (items) collection.items = items;
    if (client !== undefined) collection.client = client;

    await collection.save();

    const populatedCollection = await Collection.findById(id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedCollection,
    });
  } catch (error) {
    console.error('Update collection error:', error);
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

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    // All roles can delete any collection
    await Collection.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}