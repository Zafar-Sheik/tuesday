import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { JobCard } from '@/models/JobCard';
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
      complete
    } = await request.json();

    await dbConnect();

    const jobCard = await JobCard.findById(id);

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: 'JobCard not found' },
        { status: 404 }
      );
    }

    // Check permissions: admin can edit any, technician can edit only their own
    if (user.role !== 'admin' && jobCard.technician.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Can only edit your own job cards' },
        { status: 403 }
      );
    }

    if (date) jobCard.date = new Date(date);
    if (clientCompany) jobCard.clientCompany = clientCompany;
    if (clientName) jobCard.clientName = clientName;
    if (faultDescription) jobCard.faultDescription = faultDescription;
    if (scopeOfWork) jobCard.scopeOfWork = scopeOfWork;
    if (workCarriedOut) jobCard.workCarriedOut = workCarriedOut;
    if (timeIn) jobCard.timeIn = timeIn;
    if (timeOut) jobCard.timeOut = timeOut;
    if (comments !== undefined) jobCard.comments = comments;
    if (image !== undefined) jobCard.image = image;
    if (clientSignature !== undefined) {
      jobCard.clientSignature = clientSignature;
      if (clientSignature) {
        jobCard.signedAt = new Date();
      } else {
        jobCard.signedAt = undefined;
      }
    }
    if (signedAt !== undefined) jobCard.signedAt = signedAt ? new Date(signedAt) : undefined;
    if (complete !== undefined) jobCard.complete = complete;

    await jobCard.save();

    const populatedJobCard = await JobCard.findById(id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedJobCard,
    });
  } catch (error) {
    console.error('Update job card error:', error);
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

    const jobCard = await JobCard.findById(id);

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: 'JobCard not found' },
        { status: 404 }
      );
    }

    // Check permissions: admin can delete any, technician can delete only their own
    if (user.role !== 'admin' && jobCard.technician.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Can only delete your own job cards' },
        { status: 403 }
      );
    }

    await JobCard.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete job card error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
