import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { setSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let email, password;
  
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Hardcoded admin login
    if (email === 'admin@test.com' && password === '123456') {
      // Check if admin user exists in database
      let user = await User.findOne({ email: 'admin@test.com' });
      
      if (!user) {
        // Create admin user if not exists
        const hashedPassword = await bcrypt.hash('123456', 12);
        user = await User.create({
          name: 'Admin',
          email: 'admin@test.com',
          password: hashedPassword,
          role: 'admin',
        });
      }

      const sessionUser = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      await setSessionUser(sessionUser);

      return NextResponse.json({
        success: true,
        data: sessionUser,
      });
    }

    // For other users, check database
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const sessionUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    await setSessionUser(sessionUser);

    return NextResponse.json({
      success: true,
      data: sessionUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    
     // If database is not available but credentials match, allow login
     if (email === 'admin@test.com' && password === '123456') {
       const sessionUser = {
         _id: 'hardcoded-admin',
         name: 'Admin',
         email: 'admin@test.com',
         role: 'admin' as const,
       };

       await setSessionUser(sessionUser);

       return NextResponse.json({
         success: true,
         data: sessionUser,
       });
     }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
