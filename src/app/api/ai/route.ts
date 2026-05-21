import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${getApiBaseUrl()}/ai/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || 'Failed to fetch AI suggestions' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(result.data || result);
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
