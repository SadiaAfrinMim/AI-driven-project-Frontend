import { NextRequest, NextResponse } from 'next/server';

// Mock reviews data
const reviews = [
  {
    id: 1,
    itemId: 1,
    userId: 1,
    rating: 5,
    comment: 'Great product!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    itemId: 2,
    userId: 2,
    rating: 4,
    comment: 'Good value for money',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}