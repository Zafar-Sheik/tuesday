import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ProjectType } from '@/models/ProjectType';
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

    await dbConnect();

    // All users can view project types
    const projectTypes = await ProjectType.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: projectTypes,
    });
  } catch (error) {
    console.error('Get project types error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(['admin']);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { name, description, allowedRoles } = await request.json();

    if (!name || !allowedRoles || allowedRoles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name and at least one allowed role are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await requireRole(['admin']);
    
    const projectType = await ProjectType.create({
      name,
      description,
      allowedRoles,
      createdBy: user?._id,
    });

    return NextResponse.json({
      success: true,
      data: projectType,
    });
  } catch (error) {
    console.error('Create project type error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
