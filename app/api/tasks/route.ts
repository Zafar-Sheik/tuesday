import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Task } from '@/models/Task';
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    await dbConnect();

    let query: Record<string, unknown> = {};

    if (projectId) {
      query.project = projectId;
    } else if (user.role !== 'admin') {
      // Get projects accessible to this role
      const accessibleTypes = await ProjectType.find({
        allowedRoles: user.role,
      }).select('_id');
      
      const typeIds = accessibleTypes.map(t => t._id);
      
      const projects = await Project.find({
        $or: [
          { assignedTo: user._id },
          { projectType: { $in: typeIds } }
        ]
      }).select('_id');
      
      const projectIds = projects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const tasks = await Task.find(query)
      .populate('project')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
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

    const { project, title, description, date, startTime, endTime, assignedTo } = await request.json();

    if (!project || !title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Project, title, date, start time, and end time are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const task = await Task.create({
      project,
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      assignedTo: assignedTo || user._id,
      createdBy: user._id,
      status: 'todo',
    });

    // Calculate project progress after creating task
    await calculateProjectProgress(project);

    const populatedTask = await Task.findById(task._id)
      .populate('project')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateProjectProgress(projectId: string) {
  const tasks = await Task.find({ project: projectId });
  
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  await Project.findByIdAndUpdate(projectId, { progress });
}
