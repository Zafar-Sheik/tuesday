import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ProjectType } from '@/models/ProjectType';
import { getSessionUser } from '@/lib/auth';

export async function GET(
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

    await dbConnect();

    const projectType = await ProjectType.findById(id);

    if (!projectType) {
      return NextResponse.json(
        { success: false, error: 'Project type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projectType,
    });
  } catch (error) {
    console.error('Get project type error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { name, description, allowedRoles } = await request.json();

    await dbConnect();

    const projectType = await ProjectType.findById(id);

    if (!projectType) {
      return NextResponse.json(
        { success: false, error: 'Project type not found' },
        { status: 404 }
      );
    }

    if (name) projectType.name = name;
    if (description !== undefined) projectType.description = description;
    if (allowedRoles) projectType.allowedRoles = allowedRoles;

    await projectType.save();

    return NextResponse.json({
      success: true,
      data: projectType,
    });
  } catch (error) {
    console.error('Update project type error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const projectType = await ProjectType.findByIdAndDelete(id);

    if (!projectType) {
      return NextResponse.json(
        { success: false, error: 'Project type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete project type error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
