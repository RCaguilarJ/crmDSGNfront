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

function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("figma_session");
}

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
    return "Tu sesiÃ³n no es vÃ¡lida o expirÃ³. Inicia sesiÃ³n nuevamente.";
  }

  if (response.status === 404) {
    return "No se encontrÃ³ el endpoint de la API. Verifica que el backend estÃ© corriendo en el puerto configurado.";
  }

  if (response.status >= 500) {
    return "El servidor devolviÃ³ un error interno. Revisa la consola del backend.";
  }

  return `La solicitud fallÃ³ con estado ${response.status}.`;
}

function buildRequestInit(method: HttpMethod, options: ApiRequestOptions = {}): RequestInit {
  const headers = new Headers(options.headers);
  const token = options.token ?? (options.auth ? getStoredSession() : null);
  const init: RequestInit = {
    ...options,
    method,
    headers,
    credentials: "include",
  };

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body !== undefined && options.body !== null) {
    const isBodyInit = options.body instanceof FormData || typeof options.body === "string" || options.body instanceof URLSearchParams;

    if (isBodyInit) {
      init.body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(options.body);
    }
  }

  return init;
}

async function request<T>(method: HttpMethod, input: string, options?: ApiRequestOptions) {
  const response = await fetch(buildApiUrl(input), buildRequestInit(method, options));
  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response, payload));
  }

  return payload as T;
}

export function apiFetch<T>(input: string, init?: RequestInit) {
  const method = ((init?.method || "GET").toUpperCase() as HttpMethod);
  return request<T>(method, input, init);
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
