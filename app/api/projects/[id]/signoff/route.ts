import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { ProjectType } from '@/models/ProjectType';
import { getSessionUser } from '@/lib/auth';

export async function POST(
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
    const { signature, clientName } = await request.json();

    await dbConnect();

    const project = await Project.findById(id)
      .populate('projectType');

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project type allows technician role
    const projectType = project.projectType as unknown as { allowedRoles: string[] };
    if (!projectType.allowedRoles.includes('technician')) {
      return NextResponse.json(
        { success: false, error: 'This project does not require client sign-off' },
        { status: 400 }
      );
    }

    // Update project with signature
    project.clientSignature = signature;
    project.signedAt = new Date();
    if (clientName) {
      project.clientName = clientName;
    }
    project.status = 'completed';
    project.progress = 100;

    await project.save();

    return NextResponse.json({
      success: true,
      data: {
        clientSignature: project.clientSignature,
        signedAt: project.signedAt,
      },
    });
  } catch (error) {
    console.error('Sign-off error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
