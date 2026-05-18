import { NextRequest, NextResponse } from 'next/server';

// Mock items data
const items = [
  {
    id: 1,
    name: 'Sample Product 1',
    description: 'This is a sample product',
    price: 29.99,
    category: 'Electronics',
    image: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Sample Product 2',
    description: 'Another sample product',
    price: 49.99,
    category: 'Books',
    image: '',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}