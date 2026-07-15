import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { apiFetch } from "./api";

type ModuleResponse<T> = { data: T[] | null };

export function useServerCollection<T>(module: string, cacheKey: string, defaults: T[]): [T[], Dispatch<SetStateAction<T[]>>] {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : defaults;
    } catch {
      return defaults;
    }
  });
  const loaded = useRef(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<ModuleResponse<T>>(`/api/module-data/${module}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          skipNextSave.current = true;
          setItems(data);
        } else {
          apiFetch(`/api/module-data/${module}`, { method: "PUT", body: JSON.stringify({ data: items }) })
            .catch((error) => console.error(`No se pudo migrar el módulo ${module}`, error));
        }
        loaded.current = true;
      })
      .catch((error) => {
        console.error(`No se pudo cargar el módulo ${module}`, error);
        loaded.current = true;
      });
    return () => { cancelled = true; };
  }, [module]); // La colección inicial se captura para migrar el cache local una sola vez.

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(items));
    if (!loaded.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      apiFetch(`/api/module-data/${module}`, { method: "PUT", body: JSON.stringify({ data: items }) })
        .catch((error) => console.error(`No se pudo guardar el módulo ${module}`, error));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [items, cacheKey, module]);

  return [items, setItems];
}
