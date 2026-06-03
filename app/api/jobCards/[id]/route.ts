import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { JobCard } from '@/models/JobCard';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const jobCard = await JobCard.findById(id)
      .populate('technician', 'name email');

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: 'Job card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jobCard,
    });
  } catch (error) {
    console.error('Get job card error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const {
      date,
      clientCompany,
      clientName,
      faultDescription,
      scopeOfWork,
      workCarriedOut,
      timeIn,
      timeOut,
      comments,
      image,
      clientSignature,
      signedAt,
      complete,
      technician
    } = await request.json();

    // Validate required fields
    if (!date || !clientCompany || !clientName || !faultDescription || !scopeOfWork || !workCarriedOut || !timeIn || !timeOut) {
      return NextResponse.json(
        { success: false, error: 'Date, client company, client name, fault description, scope of work, work carried out, time in, and time out are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const jobCard = await JobCard.findById(id);

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: 'Job card not found' },
        { status: 404 }
      );
    }

    // All roles can set any technician ID; if not provided, keep current technician
    const technicianId = technician || jobCard.technician;

    // Prepare update data
    const updateData: any = {
      date: new Date(date),
      clientCompany,
      clientName,
      faultDescription,
      scopeOfWork,
      workCarriedOut,
      timeIn,
      timeOut,
      comments,
      image,
      clientSignature,
      signedAt: signedAt ? new Date(signedAt) : (clientSignature ? new Date() : undefined),
      technician: technicianId,
      complete: complete ?? false,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedJobCard = await JobCard.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: updatedJobCard,
    });
  } catch (error) {
    console.error('Update job card error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const jobCard = await JobCard.findById(id);

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: 'Job card not found' },
        { status: 404 }
      );
    }

    await JobCard.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Delete job card error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}