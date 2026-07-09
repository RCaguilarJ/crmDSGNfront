const DEFAULT_DEV_API_BASE_URL = "http://localhost:3000";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : "");

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

  if (response.status === 404) {
    return "No se encontró el endpoint de la API. Verifica que el backend esté corriendo en el puerto 3000.";
  }

  if (response.status >= 500) {
    return "El servidor devolvió un error interno. Revisa la consola del backend.";
  }

  return `La solicitud falló con estado ${response.status}.`;
}

export async function apiFetch<T>(input: string, init?: RequestInit) {
  const response = await fetch(buildApiUrl(input), init);
  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response, payload));
  }

  return payload as T;
}
