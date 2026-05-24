import Cookies from 'js-cookie';

export function getApiBaseUrl() {
  // 1. Highest priority: explicit override via .env.local (useful for testing local frontend vs live backend)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 2. Browser environment (most common during `npm run dev`)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Running locally (npm run dev / localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }

    // Deployed (Vercel, etc.) → use live Render backend
    return 'https://ai-driven-backend.onrender.com/api/v1';
  }

  // 3. Server-side rendering (Next.js SSR / build time)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api/v1';
  }

  return 'https://ai-driven-backend.onrender.com/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

export const api = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
  },
  users: `${API_BASE_URL}/users`,
  usersAll: `${API_BASE_URL}/users/all-users`,
  items: `${API_BASE_URL}/items`,
  reviews: `${API_BASE_URL}/reviews`,
  pendingItems: `${API_BASE_URL}/items/pending`,
  approveItem: (id: string) => `${API_BASE_URL}/items/${id}/approve`,
  rejectItem: (id: string) => `${API_BASE_URL}/items/${id}/reject`,
  notifications: `${API_BASE_URL}/notifications`,
  unreadCount: `${API_BASE_URL}/notifications/unread-count`,
  markAsRead: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
  markAllAsRead: `${API_BASE_URL}/notifications/mark-all-read`,
  deleteNotification: (id: string) => `${API_BASE_URL}/notifications/${id}`,
  ai: {
    insights: `${API_BASE_URL}/ai/insights`,
    generateItemContent: `${API_BASE_URL}/ai/generate-item-content`,
    chat: `${API_BASE_URL}/ai/chat`,
    generateContent: `${API_BASE_URL}/ai/generate-content`,
    analyzeTrends: `${API_BASE_URL}/ai/analyze-trends`,
    analyzeSentiment: `${API_BASE_URL}/ai/analyze-sentiment`,
    generateReview: `${API_BASE_URL}/ai/generate-review`,
    recommendations: `${API_BASE_URL}/ai/recommendations`,
  },
  selections: `${API_BASE_URL}/selections`,
  mySelections: `${API_BASE_URL}/selections/my-selections`,
  approvedSelections: `${API_BASE_URL}/selections/approved`,
  pendingSelections: `${API_BASE_URL}/selections/pending`,
  approveSelection: (id: string) => `${API_BASE_URL}/selections/${id}/approve`,
  rejectSelection: (id: string) => `${API_BASE_URL}/selections/${id}/reject`,
};

export async function fetchApi(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? Cookies.get('accessToken') : null;

  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {}

      const message = errorData.message || errorData.error || `HTTP ${response.status} ${response.statusText}`;
      console.error('[API Error]', {
        url,
        status: response.status,
        message,
        hasToken: !!token,
      });
      throw new Error(message);
    }

    return response.json();
  } catch (err: any) {
    console.error('[API Network Error]', {
      url,
      error: err.message,
      hasToken: !!token,
    });
    // Make CORS / network failures very obvious
    if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error(`Cannot reach backend at ${url}. Check if the backend is running and CORS allows this origin.`);
    }
    throw err;
  }
}
