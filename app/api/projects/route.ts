import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
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

    let query = {};

    // Technicians can only see projects assigned to them
    if (user.role === 'technician') {
      query = { assignedTo: user._id };
    } else if (user.role !== 'admin') {
      // Developers can see projects of accessible types + assigned to them
      const accessibleTypes = await ProjectType.find({
        allowedRoles: user.role,
      }).select('_id');

      const typeIds = accessibleTypes.map(t => t._id);

      query = {
        $or: [
          { assignedTo: user._id },
          { projectType: { $in: typeIds } }
        ]
      };
    }

    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const sortObj: Record<string, 1 | -1> = {};
    if (sortBy === 'dueDate') {
      sortObj.endDate = sortOrder;
    } else {
      sortObj[sortBy] = sortOrder;
    }

    const projects = await Project.find(query)
      .populate('projectType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortObj);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
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

    const { 
      name, 
      description, 
      projectType, 
      assignedTo,
      clientName,
      clientEmail,
      clientPhone,
      startDate,
      endDate
    } = await request.json();

    if (!name || !projectType || !assignedTo) {
      return NextResponse.json(
        { success: false, error: 'Name, project type, and assignee are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const project = await Project.create({
      name,
      description,
      projectType,
      assignedTo,
      createdBy: admin._id,
      clientName,
      clientEmail,
      clientPhone,
      startDate,
      endDate,
      status: 'not_started',
      progress: 0,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('projectType')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
