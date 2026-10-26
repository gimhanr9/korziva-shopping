const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("shopflow_token") : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: options.credentials || "include",
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      message: `Failed to parse response: ${response.statusText}`,
    },
  }));

  return data;
}
