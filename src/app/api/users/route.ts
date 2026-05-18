import { NextRequest, NextResponse } from 'next/server';

// Mock users data
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    bio: 'System administrator',
    profileImage: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'MANAGER',
    bio: 'Product manager',
    profileImage: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Regular User',
    email: 'user@example.com',
    role: 'USER',
    bio: 'Regular user',
    profileImage: '',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}