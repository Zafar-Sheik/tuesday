import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { ProjectType } from '@/models/ProjectType';
import { Task } from '@/models/Task';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all stats based on user role
    let projectQuery = {};
    let accessibleTypeIds: string[] = [];

    if (user.role !== 'admin') {
      const accessibleTypes = await ProjectType.find({
        allowedRoles: user.role,
      }).select('_id');
      accessibleTypeIds = accessibleTypes.map(t => t._id.toString());
      
      projectQuery = {
        $or: [
          { assignedTo: user._id },
          { projectType: { $in: accessibleTypeIds } }
        ]
      };
    }

    // Get projects
    const projects = await Project.find(projectQuery);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    // Get tasks
    let taskQuery = {};
    if (user.role !== 'admin' && accessibleTypeIds.length > 0) {
      const userProjects = await Project.find({
        $or: [
          { assignedTo: user._id },
          { projectType: { $in: accessibleTypeIds } }
        ]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      taskQuery = { project: { $in: projectIds } };
    }

    const tasks = await Task.find(taskQuery);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;

    // Get users (admin only)
    let users: unknown[] = [];
    if (user.role === 'admin') {
      users = await User.find({}).select('-password');
    }

    // Get project types (admin only)
    let projectTypes: unknown[] = [];
    if (user.role === 'admin') {
      projectTypes = await ProjectType.find({});
    }

    // Recent projects
    const recentProjects = await Project.find(projectQuery)
      .populate('projectType', 'name')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Projects by status
    const projectsByStatus = {
      not_started: projects.filter(p => p.status === 'not_started').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      on_hold: projects.filter(p => p.status === 'on_hold').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          completedTasks,
        },
        projectsByStatus,
        recentProjects,
        users,
        projectTypes,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
