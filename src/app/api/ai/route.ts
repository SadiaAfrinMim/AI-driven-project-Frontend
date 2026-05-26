import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock AI response for development - remove authentication requirement
    // In production, this would proxy to the actual backend
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock suggestions based on the input
    const query = body.query || '';
    const budget = body.budget || 100;
    const category = body.category || 'Electronics';
    
    // Mock suggestions that match the Suggestion type expected by LandingPage
    const mockSuggestions = [
      {
        itemId: '1',
        title: 'Smart Wireless Earbuds Pro',
        description: 'High-quality wireless earbuds with noise cancellation and 30-hour battery life',
        price: Math.min(89.99, budget),
        category: category,
        location: 'Dhaka, Bangladesh',
        image: 'https://example.com/earbuds.jpg',
        avgRating: 4.5,
        reviewCount: 128,
        tags: ['audio', 'wireless', 'bluetooth'],
        score: Math.round(Math.min(4.5, 5) / 5 * 100),
        reason: 'Excellent value for money with premium features'
      },
      {
        itemId: '2',
        title: 'Portable Laptop Stand',
        description: 'Ergonomic aluminum laptop stand with adjustable height and cooling design',
        price: Math.min(24.99, budget),
        category: category,
        location: 'Chittagong, Bangladesh',
        image: 'https://example.com/laptop-stand.jpg',
        avgRating: 4.3,
        reviewCount: 89,
        tags: ['accessories', 'ergonomic', 'office'],
        score: Math.round(Math.min(4.3, 5) / 5 * 100),
        reason: 'Perfect for remote work and improving posture'
      },
      {
        itemId: '3',
        title: 'LED Desk Lamp with USB Charging',
        description: 'Adjustable LED lamp with multiple brightness levels and built-in USB charging port',
        price: Math.min(34.99, budget),
        category: category,
        location: 'Sylhet, Bangladesh',
        image: 'https://example.com/desk-lamp.jpg',
        avgRating: 4.6,
        reviewCount: 203,
        tags: ['lighting', 'office', 'usb-charging'],
        score: Math.round(Math.min(4.6, 5) / 5 * 100),
        reason: 'Great for studying and working with convenient charging'
      }
    ];
    
    const mockResponse = {
      data: {
        suggestions: mockSuggestions,
        summary: `AI-generated suggestions for: "${query}" in ${category} category`
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
