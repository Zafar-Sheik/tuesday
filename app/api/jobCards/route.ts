import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { JobCard } from '@/models/JobCard';
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

    // Technicians can only see their own job cards
    if (user.role === 'technician') {
      query = { technician: user._id };
    }

    const jobCards = await JobCard.find(query)
      .populate('technician', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: jobCards,
    });
  } catch (error) {
    console.error('Get job cards error:', error);
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

    if (!date || !clientCompany || !clientName || !faultDescription || !scopeOfWork || !workCarriedOut || !timeIn || !timeOut) {
      return NextResponse.json(
        { success: false, error: 'Date, client company, client name, fault description, scope of work, work carried out, time in, and time out are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Technicians can only create job cards for themselves
    const technicianId = user.role === 'technician' ? user._id : technician || user._id;

    const jobCard = await JobCard.create({
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
      complete: complete || false,
    });

    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate('technician', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedJobCard,
    });
  } catch (error) {
    console.error('Create job card error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
