import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Delivery } from '@/models/Delivery';
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

    await dbConnect();

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // All roles can edit any delivery
    if (date) delivery.date = new Date(date);
    if (client) delivery.client = client;
    if (location) delivery.location = location;
    if (technician) delivery.technician = technician;
    if (items) delivery.items = items;
    if (receivedBy !== undefined) delivery.receivedBy = receivedBy;
    if (clientSignature !== undefined) {
      delivery.clientSignature = clientSignature;
      if (clientSignature) {
        delivery.signedAt = new Date();
      } else {
        delivery.signedAt = undefined;
      }
    }
    if (signedAt !== undefined) delivery.signedAt = signedAt ? new Date(signedAt) : undefined;
    if (image !== undefined) delivery.image = image;
    if (complete !== undefined) delivery.complete = complete;

    await delivery.save();

    const populatedDelivery = await Delivery.findById(id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedDelivery,
    });
  } catch (error) {
    console.error('Update delivery error:', error);
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

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // All roles can delete any delivery
    await Delivery.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Delete delivery error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}