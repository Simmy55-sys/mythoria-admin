const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for authentication
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const adminApi = {
  // Authentication
  login: (data: { email: string; password: string }) =>
    apiRequest<{ user: User }>("/account/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<{ message: string }>("/account/logout", {
      method: "POST",
    }),

  getCurrentUser: () => apiRequest<User>("/account/me"),

  // Translators
  getTranslators: () => apiRequest<Translator[]>("/admin/translators"),

  createTranslator: (data: { username: string; email: string }) =>
    apiRequest<{ id: string; username: string; email: string }>(
      "/admin/create-translator",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  toggleTranslatorStatus: (id: string) =>
    apiRequest<{ message: string }>(`/admin/translators/${id}/toggle-status`, {
      method: "PATCH",
    }),

  deleteTranslator: (id: string) =>
    apiRequest<{ message: string }>(`/admin/translators/${id}`, {
      method: "DELETE",
    }),

  // Series
  getSeries: () => apiRequest<NovelSeries[]>("/admin/series"),

  deleteSeries: (id: string) =>
    apiRequest<{ message: string }>(`/admin/series/${id}`, {
      method: "DELETE",
    }),

  assignSeries: (data: {
    translatorId: string;
    seriesName: string;
    adminRating?: number;
  }) =>
    apiRequest<{ message: string; assignmentId: string }>(
      "/admin/assign-series",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Categories
  getCategories: () => apiRequest<string[]>("/category"),
};

export type User = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "translator" | "reader";
};

export type Translator = {
  id: string;
  username: string;
  email: string;
  status: "active" | "suspended";
  assignedSeries: number;
  chaptersTranslated: number;
  joinedDate: string;
};

export type NovelSeries = {
  id: string;
  title: string;
  cover: string;
  totalChapters: number;
  status: "ongoing" | "completed";
  translator: string | null;
  categories: string[];
};
