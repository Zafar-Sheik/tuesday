import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Task } from '@/models/Task';
import { Project } from '@/models/Project';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const task = await Task.findById(id)
      .populate('project')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);
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
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, description, status, date, startTime, endTime, assignedTo } = await request.json();

    await dbConnect();

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) {
      task.status = status;
      if (status === 'done') {
        task.completedAt = new Date();
      }
    }
    if (date) task.date = new Date(date);
    if (startTime) task.startTime = startTime;
    if (endTime) task.endTime = endTime;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();

    // Calculate project progress
    const tasks = await Task.find({ project: task.project });
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    await Project.findByIdAndUpdate(task.project, { progress });

    const populatedTask = await Task.findById(id)
      .populate('project')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
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
    const user = await requireRole(['admin', 'developer', 'technician']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const projectId = task.project;
    await Task.findByIdAndDelete(id);

    // Recalculate project progress
    const tasks = await Task.find({ project: projectId });
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    await Project.findByIdAndUpdate(projectId, { progress });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
