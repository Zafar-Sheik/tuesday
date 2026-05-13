import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection } from '@/models/Collection';
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

    let query = {};

    // Technicians can only see their own collections
    if (user.role === 'technician') {
      query = { technician: user._id };
    }

    const collections = await Collection.find(query)
      .populate('technician', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    console.error('Get collections error:', error);
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
      supplier,
      location,
      technician,
      vehicle,
      items,
      client
    } = await request.json();

    if (!date || !supplier || !location || !vehicle || !items || !client) {
      return NextResponse.json(
        { success: false, error: 'Date, supplier, location, vehicle, items, and client are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Technicians can only create collections for themselves
    const technicianId = user.role === 'technician' ? user._id : technician;

    const collection = await Collection.create({
      date: new Date(date),
      supplier,
      location,
      technician: technicianId,
      vehicle,
      items,
      client,
    });

    const populatedCollection = await Collection.findById(collection._id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedCollection,
    });
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
