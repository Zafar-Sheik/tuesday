import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workshop } from '@/models/Workshop';
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
      client,
      itemBookedIn,
      specs,
      faultOfItem,
      workScope,
      image,
      complete
    } = await request.json();

    await dbConnect();

    const workshop = await Workshop.findById(id);

    if (!workshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop item not found' },
        { status: 404 }
      );
    }

    // Check permissions: admin can edit any, technician can edit only their own
    if (user.role !== 'admin' && workshop.technician.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Can only edit your own workshop items' },
        { status: 403 }
      );
    }

    if (client) workshop.client = client;
    if (itemBookedIn) workshop.itemBookedIn = itemBookedIn;
    if (specs) workshop.specs = specs;
    if (faultOfItem) workshop.faultOfItem = faultOfItem;
    if (workScope) workshop.workScope = workScope;
    if (image !== undefined) workshop.image = image;
    if (complete !== undefined) workshop.complete = complete;

    await workshop.save();

    const populatedWorkshop = await Workshop.findById(id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedWorkshop,
    });
  } catch (error) {
    console.error('Update workshop error:', error);
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

    const workshop = await Workshop.findById(id);

    if (!workshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop item not found' },
        { status: 404 }
      );
    }

    // Check permissions: admin can delete any, technician can delete only their own
    if (user.role !== 'admin' && workshop.technician.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Can only delete your own workshop items' },
        { status: 403 }
      );
    }

    await Workshop.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete workshop error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
