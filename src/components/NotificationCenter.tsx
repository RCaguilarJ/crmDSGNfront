import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarClock, CheckCheck, ClipboardCheck, ExternalLink } from "lucide-react";
import type { Client } from "../types";
import type { Task } from "./CRMTasks";
import { apiFetch } from "../lib/api";

type CRMNotification = {
  id: string;
  serverId?: string;
  title: string;
  message: string;
  view: string;
  kind: "renewal" | "task" | "activity";
  readAt?: string | null;
};

interface NotificationCenterProps {
  clients: Client[];
  tasks: Task[];
  username: string;
  onNavigate: (view: string) => void;
}

const USER_DISPLAY_NAMES: Record<string, string[]> = {
  adriana: ["adriana", "adriana garcia", "adriana garcía"],
  jorge: ["jorge"],
  carlos: ["carlos", "carlos mendoza"],
  sofia: ["sofia", "sofía", "sofia rodriguez", "sofía rodríguez"],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function isAssignedTo(task: Task, username: string) {
  const assignee = normalize(task.assignee || "");
  const aliases = USER_DISPLAY_NAMES[normalize(username)] || [username];
  return aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return assignee === normalizedAlias || assignee.startsWith(`${normalizedAlias} `);
  });
}

function base64UrlToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

export default function NotificationCenter({ clients, tasks, username, onNavigate }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activityNotifications, setActivityNotifications] = useState<CRMNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [pushStatus, setPushStatus] = useState<"idle" | "activating" | "active" | "error">("idle");
  const initialized = useRef(false);
  const readKey = `crm_notification_reads_${username}`;
  const pushedKey = `crm_notification_pushed_${username}`;

  useEffect(() => {
    try { setReadIds(JSON.parse(localStorage.getItem(readKey) || "[]")); }
    catch { setReadIds([]); }
  }, [readKey]);

  useEffect(() => {
    let active = true;
    const loadActivity = async () => {
      try {
        const data = await apiFetch<{ notifications: Array<{ id: string | number; title: string; message: string; view: string; readAt?: string | null }> }>("/api/notifications");
        if (!active) return;
        setActivityNotifications(data.notifications.map((item) => ({
          id: `activity:${item.id}`,
          serverId: String(item.id),
          title: item.title,
          message: item.message,
          view: item.view,
          kind: "activity",
          readAt: item.readAt || null,
        })));
      } catch (error) {
        console.error("No se pudieron cargar las notificaciones", error);
      }
    };
    void loadActivity();
    const interval = window.setInterval(loadActivity, 15000);
    const onVisible = () => { if (document.visibilityState === "visible") void loadActivity(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [username]);

  const notifications = useMemo<CRMNotification[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warningLimit = new Date(today);
    warningLimit.setDate(warningLimit.getDate() + 7);

    const renewalNotifications = clients
      .filter((client) => client.nextRenewal && client.status !== "Suspendido")
      .map((client) => ({ client, date: new Date(`${client.nextRenewal}T00:00:00`) }))
      .filter(({ date }) => !Number.isNaN(date.getTime()) && date <= warningLimit)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ client, date }) => {
        const overdue = date < today;
        const days = Math.round((date.getTime() - today.getTime()) / 86400000);
        return {
          id: `renewal:${client.id}:${client.nextRenewal}`,
          title: overdue ? "Vencimiento de cliente" : "Renovación próxima",
          message: overdue
            ? `${client.companyName} venció el ${date.toLocaleDateString("es-MX")}.`
            : `${client.companyName} vence ${days === 0 ? "hoy" : `en ${days} día${days === 1 ? "" : "s"}`}.`,
          view: "clients" as const,
          kind: "renewal" as const,
        };
      });

    const taskNotifications = tasks
      .filter((task) => task.column !== "Entregado" && isAssignedTo(task, username))
      .map((task) => ({
        id: `task:${task.id}`,
        title: "Nueva tarea asignada",
        message: `${task.title}${task.projectName ? ` · ${task.projectName}` : ""}`,
        view: "tasks" as const,
        kind: "task" as const,
      }));

    return [...activityNotifications, ...taskNotifications, ...renewalNotifications];
  }, [activityNotifications, clients, tasks, username]);

  useEffect(() => {
    if (!initialized.current) initialized.current = true;
    if (permission !== "granted" || notifications.length === 0) return;

    let pushed: string[] = [];
    try { pushed = JSON.parse(localStorage.getItem(pushedKey) || "[]"); } catch { pushed = []; }
    const fresh = notifications.filter((item) => item.kind !== "activity" && !pushed.includes(item.id)).slice(0, 3);
    fresh.forEach((item) => new Notification(item.title, { body: item.message, icon: "/desingsgdl-logo.png", tag: item.id }));
    if (fresh.length) {
      localStorage.setItem(pushedKey, JSON.stringify([...new Set([...pushed, ...fresh.map((item) => item.id)])].slice(-200)));
    }
  }, [notifications, permission, pushedKey]);

  const isRead = (item: CRMNotification) => Boolean(item.readAt) || readIds.includes(item.id);
  const unread = notifications.filter((item) => !isRead(item));

  const markAllRead = () => {
    const next = [...new Set([...readIds, ...notifications.map((item) => item.id)])].slice(-300);
    setReadIds(next);
    localStorage.setItem(readKey, JSON.stringify(next));
    setActivityNotifications((items) => items.map((item) => ({ ...item, readAt:item.readAt || new Date().toISOString() })));
    void apiFetch("/api/notifications/read-all", { method:"POST" }).catch((error) => console.error("No se pudieron marcar las notificaciones", error));
  };

  const markRead = (item: CRMNotification) => {
    const { id } = item;
    if (readIds.includes(id)) return;
    const next = [...new Set([...readIds, id])].slice(-300);
    setReadIds(next);
    localStorage.setItem(readKey, JSON.stringify(next));
    if (item.serverId && !item.readAt) {
      setActivityNotifications((items) => items.map((current) => current.id === id ? { ...current, readAt:new Date().toISOString() } : current));
      void apiFetch(`/api/notifications/${item.serverId}/read`, { method:"PATCH" }).catch((error) => console.error("No se pudo marcar la notificación", error));
    }
  };

  const closePanel = () => {
    markAllRead();
    setOpen(false);
  };

  const togglePanel = () => {
    if (open) closePanel();
    else setOpen(true);
  };

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") await subscribeToPush();
  };

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("error");
      return;
    }
    setPushStatus("activating");
    try {
      const { publicKey } = await apiFetch<{ publicKey: string }>("/api/push/public-key");
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(publicKey),
      });
      await apiFetch("/api/push/subscribe", { method: "POST", body: subscription.toJSON() });
      setPushStatus("active");
    } catch (error) {
      console.error("No se pudo activar Web Push", error);
      setPushStatus("error");
    }
  };

  useEffect(() => {
    if (permission === "granted") void subscribeToPush();
  }, [permission, username]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notificaciones${unread.length ? `, ${unread.length} sin leer` : ""}`}
        onClick={togglePanel}
        className="relative rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-100"
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-black text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button aria-label="Cerrar notificaciones" className="fixed inset-0 z-40 cursor-default" onClick={closePanel} />
          <section className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-xs font-black text-slate-900">Notificaciones</h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{unread.length} sin leer</p>
              </div>
              {unread.length > 0 && <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><CheckCheck className="h-3.5 w-3.5" />Marcar leídas</button>}
            </header>

            {permission === "default" && (
              <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[10px] text-blue-800">Activa los avisos del navegador para recibir alertas mientras el CRM esté abierto.</p>
                <button onClick={requestPermission} className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white">Activar avisos</button>
              </div>
            )}
            {permission === "granted" && pushStatus !== "active" && (
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-[10px] text-amber-800">{pushStatus === "activating" ? "Registrando este dispositivo…" : pushStatus === "error" ? "No se pudo activar Web Push. Revisa la configuración VAPID del servidor." : "Preparando avisos en segundo plano…"}</p>
                {pushStatus === "error" && <button onClick={subscribeToPush} className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Reintentar</button>}
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-[11px] text-slate-400">No hay notificaciones pendientes.</p>
              ) : notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { markRead(item); setOpen(false); onNavigate(item.view); }}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${isRead(item) ? "bg-white" : "bg-blue-50/50"}`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.kind === "task" ? "bg-violet-100 text-violet-600" : item.kind === "activity" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                    {item.kind === "task" ? <ClipboardCheck className="h-4 w-4" /> : item.kind === "activity" ? <Bell className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[11px] text-slate-800">{item.title}</strong>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{item.message}</span>
                  </span>
                  <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
