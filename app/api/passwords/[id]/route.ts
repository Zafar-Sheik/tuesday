import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PasswordEntry } from '@/models/PasswordEntry';
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

    const entry = await PasswordEntry.findById(id)
      .populate('createdBy', 'name email');

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Password entry not found' },
        { status: 404 }
      );
    }

    // All roles can view any password entry
    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Get password error:', error);
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
    const { title, password, notes } = await request.json();

    if (!title || !password) {
      return NextResponse.json(
        { success: false, error: 'Title and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const entry = await PasswordEntry.findById(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Password entry not found' },
        { status: 404 }
      );
    }

    // All roles can update any password entry
    entry.title = title;
    entry.password = password;
    entry.notes = notes;
    await entry.save();

    const populatedEntry = await PasswordEntry.findById(entry._id)
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedEntry,
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const entry = await PasswordEntry.findById(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Password entry not found' },
        { status: 404 }
      );
    }

    // All roles can delete any password entry
    await entry.deleteOne();

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Delete password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}