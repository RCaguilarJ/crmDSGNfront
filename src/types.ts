export type ClientStatus = "Activo" | "Próximo a vencer" | "Vencido" | "Suspendido";
export type InvoiceStatus = "Pagado" | "Pendiente" | "Vencido";
export type TaskPriority = "Baja" | "Media" | "Alta";
export type TaskColumn = "Backlog" | "Diseño" | "Desarrollo" | "QA" | "Entregado";

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  services: number;
  responsible: string | null;
  nextRenewal: string | null;
  avatarInitials: string;
  avatarBg: string;
  createdAt?: string;
}

export type ClientDraft = Omit<Client, "id" | "createdAt">;

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  figmaNode?: string;
  tailwindClasses?: string;
  componentCode?: string;
  createdAt: string;
}

export type SavedProjectDraft = Omit<SavedProject, "id" | "createdAt">;

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  columnName: TaskColumn;
  priority: TaskPriority;
  projectName: string | null;
  assignee: string | null;
  createdAt?: string;
}

export interface InvoiceRecord {
  id: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  isInvoiced?: boolean;
  description: string;
  createdAt?: string;
}

export interface User {
  username: string;
  projectsCount: number;
  role?: string;
}

export interface FigmaNodeInfo {
  id: string;
  name: string;
  type: string;
  color?: string;
  spacing?: string;
  borderRadius?: string;
  shadow?: string;
  fontSize?: string;
}

export interface PlaygroundConfig {
  paddingX: string;
  paddingY: string;
  bgColor: string;
  textColor: string;
  borderRadius: string;
  shadow: string;
  borderWidth: string;
  borderColor: string;
  hasIcon: boolean;
  isAnimated: boolean;
  fontSize: string;
}
