import Cookies from 'js-cookie';

// Works locally and on deployed environments.
// Configure NEXT_PUBLIC_API_BASE_URL in Vercel/Render/Netlify.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`
  : 'http://localhost:5000/api/v1';


export const api = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
  },
  users: `${API_BASE_URL}/users`,
  items: `${API_BASE_URL}/items`,
  pendingItems: `${API_BASE_URL}/items/pending`,
  approveItem: (id: string) => `${API_BASE_URL}/items/${id}/approve`,
  rejectItem: (id: string) => `${API_BASE_URL}/items/${id}/reject`,
  reviews: `${API_BASE_URL}/reviews`,
  ai: {
    generateContent: `${API_BASE_URL}/ai/generate-content`,
    generateItemContent: `${API_BASE_URL}/ai/generate-item-content`,
    recommendations: `${API_BASE_URL}/ai/recommendations`,
    chat: `${API_BASE_URL}/ai/chat`,
    analytics: `${API_BASE_URL}/ai/analytics`,
    generateBlog: `${API_BASE_URL}/ai/generate-blog`,
    chatHistory: `${API_BASE_URL}/ai/chat-history`,
    insights: `${API_BASE_URL}/ai/insights`,
    analyzeTrends: `${API_BASE_URL}/ai/analyze-trends`,
    analyzeSentiment: `${API_BASE_URL}/ai/analyze-sentiment`,
    generateReview: `${API_BASE_URL}/ai/generate-review`,
    recommendations: `${API_BASE_URL}/ai/recommendations`,
  },
};

export const fetchApi = async (url: string, options?: RequestInit) => {
  const token = Cookies.get('accessToken');
  const headers: Record<string, string> = {
    ...options?.headers as Record<string, string>,
  };

  // Don't set Content-Type for FormData - let browser set it automatically
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = json?.message || json?.error?.message || response.statusText || 'Unknown API error';
    throw new Error(message);
  }

  return json;
};
