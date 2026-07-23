// API base URL — in production, use the Render backend; in dev, use localhost
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://deutschcoach-hjs0.onrender.com"
    : "http://localhost:8001");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Network error — please check your connection."
        : err instanceof Error
          ? err.message
          : "An unexpected network error occurred."
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  get<T>(url: string): Promise<T> {
    return request<T>("GET", url);
  },
  post<T>(url: string, body?: unknown): Promise<T> {
    return request<T>("POST", url, body);
  },
  put<T>(url: string, body?: unknown): Promise<T> {
    return request<T>("PUT", url, body);
  },
  patch<T>(url: string, body?: unknown): Promise<T> {
    return request<T>("PATCH", url, body);
  },
  delete<T>(url: string): Promise<T> {
    return request<T>("DELETE", url);
  },
};
