import type {
  Client,
  ClientDraft,
  InvoiceRecord,
  SavedProject,
  SavedProjectDraft,
  TaskRecord,
  User,
} from "../types";

const DEFAULT_DEV_API_BASE_URL = "http://localhost:3000";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : "");

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions extends Omit<RequestInit, "body" | "method"> {
  auth?: boolean;
  body?: BodyInit | object | null;
  token?: string | null;
}

interface AuthPayload {
  username: string;
  password: string;
}

interface AuthResponse {
  sessionId: string;
  user: User;
}

interface SessionResponse {
  user: User | null;
}

interface ClientsResponse {
  clients: Client[];
}

interface ClientResponse {
  success: boolean;
  client: Client;
}

interface ProjectsResponse {
  projects: SavedProject[];
}

interface ProjectResponse {
  success: boolean;
  project: SavedProject;
}

interface TasksResponse {
  tasks: TaskRecord[];
}

interface InvoicesResponse {
  invoices: InvoiceRecord[];
}

function buildApiUrl(input: string) {
  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  if (!apiBaseUrl) {
    return input;
  }

  const normalizedPath = input.startsWith("/") ? input : `/${input}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem("figma_session");
}

export function storeSession(token: string) {
  if (typeof window !== "undefined") window.sessionStorage.setItem("figma_session", token);
}

export function clearStoredSession() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("figma_session");
    window.localStorage.removeItem("figma_session");
  }
}

// Refresh tokens are stored in HttpOnly cookies set by the backend; do not persist them in JS

async function parseJsonSafely(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function getErrorMessage(response: Response, payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  if (response.status === 401) {
    return "Tu sesión no es válida o expiró. Inicia sesión nuevamente.";
  }

  if (response.status === 404) {
    return "No se encontró el endpoint de la API. Verifica que el backend esté disponible.";
  }

  if (response.status >= 500) {
    return "El servidor devolvió un error interno. Revisa la consola del backend.";
  }

  return `La solicitud falló con estado ${response.status}.`;
}

function buildRequestInit(method: HttpMethod, options: ApiRequestOptions = {}): RequestInit {
  const { auth, body, token: suppliedToken, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  const token = suppliedToken ?? (auth ? getStoredSession() : null);
  const init: RequestInit = {
    ...requestOptions,
    method,
    headers,
    credentials: "include",
  };

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined && body !== null) {
    const isBodyInit = body instanceof FormData || typeof body === "string" || body instanceof URLSearchParams;

    if (isBodyInit) {
      if (typeof body === "string") headers.set("Content-Type", "application/json");
      init.body = body;
    } else {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(body);
    }
  }

  return init;
}

async function request<T>(method: HttpMethod, input: string, options?: ApiRequestOptions) {
  const makeFetch = (tokenToUse?: string | null) => fetch(buildApiUrl(input), buildRequestInit(method, { ...options, token: tokenToUse }));

  let response = await makeFetch(options?.token ?? (options?.auth ? getStoredSession() : null));
  let payload = await parseJsonSafely(response);

  // If unauthorized, try refresh endpoint (backend will read refresh token from cookie)
  if (response.status === 401) {
    try {
      const refreshRes = await fetch(buildApiUrl("/api/auth/refresh"), buildRequestInit("POST", {}));
      const refreshPayload = await parseJsonSafely(refreshRes);
      if (refreshRes.ok && refreshPayload && typeof refreshPayload === "object") {
        const newAccess = (refreshPayload as any).sessionId;
        if (newAccess) {
          // save new access token
          storeSession(newAccess);
          // retry original request with new access token
          response = await makeFetch(newAccess);
          payload = await parseJsonSafely(response);
        }
      }
    } catch (e) {
      // fallthrough to throwing below
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response, payload));
  }

  // If this is an auth response with tokens, persist access token; refresh token is in cookie
  try {
    const urlPath = input.toString();
    if (payload && typeof payload === 'object' && (urlPath.includes('/api/auth/login') || urlPath.includes('/api/auth/signup') || urlPath.includes('/api/auth/refresh'))) {
      const anyPayload = payload as any;
      if (anyPayload.sessionId && typeof window !== 'undefined') {
        storeSession(anyPayload.sessionId);
      }
    }
  } catch (e) {
    // ignore
  }

  return payload as T;
}

export function apiFetch<T>(input: string, init?: RequestInit) {
  const method = ((init?.method || "GET").toUpperCase() as HttpMethod);
  const needsAuth = input.startsWith("/api/") && !input.startsWith("/api/auth/") && input !== "/api/generate-component";
  return request<T>(method, input, { ...init, auth: needsAuth });
}

export const api = {
  auth: {
    login: (payload: AuthPayload) => request<AuthResponse>("POST", "/api/auth/login", { body: payload }),
    signup: (payload: AuthPayload) => request<AuthResponse>("POST", "/api/auth/signup", { body: payload }),
    me: (token?: string | null) => request<SessionResponse>("GET", "/api/auth/me", { token }),
  },
  clients: {
    list: (token?: string | null) => request<ClientsResponse>("GET", "/api/clients", { auth: true, token }),
    create: (payload: ClientDraft, token?: string | null) =>
      request<ClientResponse>("POST", "/api/clients", { auth: true, token, body: payload }),
    update: (id: string, payload: Partial<ClientDraft>, token?: string | null) =>
      request<ClientResponse>("PUT", `/api/clients/${id}`, { auth: true, token, body: payload }),
    remove: (id: string, token?: string | null) =>
      request<{ success: boolean; message: string }>("DELETE", `/api/clients/${id}`, { auth: true, token }),
  },
  projects: {
    list: (token?: string | null) => request<ProjectsResponse>("GET", "/api/projects", { auth: true, token }),
    create: (payload: SavedProjectDraft, token?: string | null) =>
      request<ProjectResponse>("POST", "/api/projects", { auth: true, token, body: payload }),
    update: (id: string, payload: SavedProjectDraft, token?: string | null) =>
      request<ProjectResponse>("PUT", `/api/projects/${id}`, { auth: true, token, body: payload }),
    remove: (id: string, token?: string | null) =>
      request<{ success: boolean; message: string }>("DELETE", `/api/projects/${id}`, { auth: true, token }),
  },
  tasks: {
    list: (token?: string | null) => request<TasksResponse>("GET", "/api/tasks", { auth: true, token }),
  },
  invoices: {
    list: (token?: string | null) => request<InvoicesResponse>("GET", "/api/invoices", { auth: true, token }),
  },
};

export type {
  AuthPayload,
  AuthResponse,
  ClientResponse,
  ClientsResponse,
  InvoicesResponse,
  ProjectsResponse,
  ProjectResponse,
  SessionResponse,
  TasksResponse,
};
