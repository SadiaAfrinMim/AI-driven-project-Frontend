import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database - in production, use a real database
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  bio: string;
  profileImage: string;
  createdAt: string;
}

const users: User[] = [
  // Default admin user for testing
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'ADMIN',
    bio: '',
    profileImage: '',
    createdAt: new Date().toISOString(),
  },
  // Default manager user for testing
  {
    id: 2,
    name: 'Manager User',
    email: 'manager@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'MANAGER',
    bio: '',
    profileImage: '',
    createdAt: new Date().toISOString(),
  },
  // Default user for testing
  {
    id: 3,
    name: 'Regular User',
    email: 'user@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'USER',
    bio: '',
    profileImage: '',
    createdAt: new Date().toISOString(),
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'your-secret-key', // In production, use environment variable
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      profileImage: user.profileImage,
    };

    return NextResponse.json({
      accessToken: token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}