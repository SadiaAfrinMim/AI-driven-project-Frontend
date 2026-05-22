export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api/v1'
      : 'https://ai-driven-backend.onrender.com/api/v1';
  }

  return window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/v1'
    : 'https://ai-driven-backend.onrender.com/api/v1';
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
};

export async function fetchApi(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] : null;
  
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'API request failed');
  }

  return response.json();
}
