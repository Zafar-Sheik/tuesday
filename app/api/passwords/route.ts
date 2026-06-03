import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PasswordEntry } from '@/models/PasswordEntry';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    await dbConnect();

    // All users can see all password entries (removed restriction)
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const passwords = await PasswordEntry.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: passwords,
    });
  } catch (error) {
    console.error('Get passwords error:', error);
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

    const { title, password, notes } = await request.json();

    if (!title || !password) {
      return NextResponse.json(
        { success: false, error: 'Title and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const entry = await PasswordEntry.create({
      title,
      password,
      notes,
      createdBy: user._id,
    });

    const populatedEntry = await PasswordEntry.findById(entry._id)
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedEntry,
    });
  } catch (error) {
    console.error('Create password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}