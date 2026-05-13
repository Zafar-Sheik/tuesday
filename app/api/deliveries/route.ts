import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Delivery } from '@/models/Delivery';
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

    // Technicians can only see their own deliveries
    if (user.role === 'technician') {
      query = { technician: user._id };
    }

    const deliveries = await Delivery.find(query)
      .populate('technician', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
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
      client,
      location,
      technician,
      items,
      receivedBy,
      clientSignature,
      signedAt,
      image,
      complete
    } = await request.json();

    if (!date || !client || !location || !items || !receivedBy) {
      return NextResponse.json(
        { success: false, error: 'Date, client, location, items, and received by are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Technicians can only create deliveries for themselves
    const technicianId = user.role === 'technician' ? user._id : technician;

    const delivery = await Delivery.create({
      date: new Date(date),
      client,
      location,
      technician: technicianId,
      items,
      receivedBy,
      clientSignature,
      signedAt: signedAt ? new Date(signedAt) : (clientSignature ? new Date() : undefined),
      image,
      complete: complete || false,
    });

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedDelivery,
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
