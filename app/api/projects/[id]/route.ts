import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { Task } from '@/models/Task';
import { User } from '@/models/User';
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

    const project = await Project.findById(id)
      .populate('projectType')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Technicians can only view projects assigned to them
    if (user.role === 'technician' && project.assignedTo._id.toString() !== user._id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - You can only view your own projects' },
        { status: 401 }
      );
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    // Get available users for assignment (based on project type)
    let availableUsers = [];
    const projectType = await ProjectType.findById(project.projectType);
    if (projectType) {
      availableUsers = await User.find({ role: { $in: projectType.allowedRoles } }).select('name email role');
    }

    return NextResponse.json({
      success: true,
      data: {
        project,
        tasks,
        availableUsers,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { 
      name, 
      description, 
      status, 
      assignedTo,
      clientName,
      clientEmail,
      clientPhone,
      startDate,
      endDate
    } = await request.json();

    await dbConnect();

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check permissions: admin can edit any, technician can edit only their assigned projects
    if (user.role !== 'admin' && project.assignedTo._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Can only edit your own projects' },
        { status: 403 }
      );
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (assignedTo) project.assignedTo = assignedTo;
    if (clientName !== undefined) project.clientName = clientName;
    if (clientEmail !== undefined) project.clientEmail = clientEmail;
    if (clientPhone !== undefined) project.clientPhone = clientPhone;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);

    await project.save();

    const populatedProject = await Project.findById(id)
      .populate('projectType')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error);
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check permissions: admin can delete any, technician can delete only their own assigned projects
    if (user.role !== 'admin' && project.assignedTo._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Can only delete your own projects' },
        { status: 403 }
      );
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: id });

    // Delete the project
    await Project.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
