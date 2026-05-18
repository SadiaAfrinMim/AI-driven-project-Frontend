import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, preferences } = body;

    // Mock AI response
    const mockSuggestions = [
      {
        id: 1,
        name: 'AI Recommended Product 1',
        description: 'This product matches your preferences perfectly!',
        price: 39.99,
        category: 'Electronics',
        reason: 'Based on your interest in technology and budget',
      },
      {
        id: 2,
        name: 'AI Recommended Product 2',
        description: 'Another great option based on your search history',
        price: 24.99,
        category: 'Books',
        reason: 'Matches your reading preferences',
      },
    ];

    return NextResponse.json({
      suggestions: mockSuggestions,
      query: query || 'general',
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}