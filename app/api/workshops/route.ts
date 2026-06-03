import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workshop } from '@/models/Workshop';
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

    // All users can see all workshop items (removed technician restriction)
    let query = {};

    const workshops = await Workshop.find(query)
      .populate('technician', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: workshops,
    });
  } catch (error) {
    console.error('Get workshops error:', error);
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
      client,
      itemBookedIn,
      specs,
      faultOfItem,
      workScope,
      image,
      complete,
      technician
    } = await request.json();

    if (!client || !itemBookedIn || !specs || !faultOfItem || !workScope) {
      return NextResponse.json(
        { success: false, error: 'Client, item booked in, specs, fault of item, and work scope are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // All roles can specify any technician ID; if not provided, default to current user
    const technicianId = technician || user._id;

    const workshop = await Workshop.create({
      client,
      itemBookedIn,
      specs,
      faultOfItem,
      workScope,
      image,
      complete: complete || false,
      technician: technicianId,
    });

    const populatedWorkshop = await Workshop.findById(workshop._id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedWorkshop,
    });
  } catch (error) {
    console.error('Create workshop error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}