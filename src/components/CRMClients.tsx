import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  DollarSign, 
  Briefcase, 
  Building2,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  User,
  Layers,
  Calendar,
  Globe,
  Clock,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  ExternalLink
} from "lucide-react";

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "Activo" | "Próximo a vencer" | "Vencido" | "Suspendido";
  services: number;
  responsible: string;
  nextRenewal: string;
  avatarInitials: string;
  avatarBg: string;
}

interface CRMClientsProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, "id">) => void;
  onDeleteClient: (id: string) => void;
  onUpdateClientStatus: (id: string, status: Client["status"]) => void;
  onSelectClient?: (client: Client) => void;
}

const AVATAR_COLORS = [
  "bg-[#f59e0b]", // orange/amber
  "bg-[#ec4899]", // pink
  "bg-[#eab308]", // yellow
  "bg-[#84cc16]", // lime/green
  "bg-[#a855f7]", // purple
  "bg-[#10b981]", // emerald/teal
  "bg-[#ef4444]", // red
  "bg-[#1d63ff]", // custom brand blue
  "bg-[#6366f1]"  // indigo
];

export default function CRMClients({ 
  clients, 
  onAddClient, 
  onDeleteClient, 
  onUpdateClientStatus,
  onSelectClient 
}: CRMClientsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Todos" | "Activo" | "Próximo a vencer" | "Vencido" | "Suspendido">("Todos");
  
  // Local state for entering a specific client's profile ("entrar a la parte del cliente")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStatus, setNewStatus] = useState<Client["status"]>("Activo");
  const [newServices, setNewServices] = useState<number>(3);
  const [newResponsible, setNewResponsible] = useState("Luis Pérez");
  const [newRenewal, setNewRenewal] = useState("2025-06-30");

  // Edit Client Form State
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getInitials = (name: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRandomBg = () => {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newContact.trim()) {
      alert("Por favor completa los campos principales.");
      return;
    }

    const initials = getInitials(newCompany);
    const bg = getRandomBg();

    onAddClient({
      companyName: newCompany,
      contactName: newContact,
      email: newEmail || `${newCompany.toLowerCase().replace(/[^a-z0-9]/g, "")}@contacto.mx`,
      phone: newPhone || "+52 55 1234 5678",
      status: newStatus,
      services: Number(newServices) || 1,
      responsible: newResponsible,
      nextRenewal: newRenewal || "2025-06-30",
      avatarInitials: initials,
      avatarBg: bg
    });

    // Reset Form
    setNewCompany("");
    setNewContact("");
    setNewEmail("");
    setNewPhone("");
    setNewStatus("Activo");
    setNewServices(3);
    setNewResponsible("Luis Pérez");
    setNewRenewal("2025-06-30");
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    // We can simulate updating in parent by deleting and re-adding or direct mutation
    // To ensure full compatibility with parent states, we update the state directly or use the status callback
    onUpdateClientStatus(editingClient.id, editingClient.status);
    
    // Mutate local state values
    const updatedList = clients.map(c => c.id === editingClient.id ? editingClient : c);
    localStorage.setItem("crm_clients", JSON.stringify(updatedList));
    
    if (selectedClient && selectedClient.id === editingClient.id) {
      setSelectedClient(editingClient);
    }
    
    setEditingClient(null);
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "Todos" || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Paginated clients
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    if (onSelectClient) {
      onSelectClient(client);
    }
  };

  // Detailed client view ("la parte del cliente")
  if (selectedClient) {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Back navigation button */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedClient(null)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al listado de clientes
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => setEditingClient(selectedClient)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar Información
            </button>
            <button 
              onClick={() => {
                if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
                  onDeleteClient(selectedClient.id);
                  setSelectedClient(null);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar Cuenta
            </button>
          </div>
        </div>

        {/* Client Cover Header Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            {/* Elegant avatar circle matching screenshot theme */}
            <div className={`w-16 h-16 rounded-full ${selectedClient.avatarBg} text-white flex items-center justify-center font-extrabold text-2xl uppercase shadow-md`}>
              {selectedClient.avatarInitials}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                  {selectedClient.companyName}
                </h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide border uppercase ${
                  selectedClient.status === "Activo" ? "bg-[#eafaf1] text-[#00b289] border-[#d2f6e4]" :
                  selectedClient.status === "Próximo a vencer" ? "bg-[#fff8eb] text-[#f59e0b] border-[#ffe9cc]" :
                  selectedClient.status === "Vencido" ? "bg-[#fef2f2] text-[#ef4444] border-[#fee2e2]" :
                  "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]"
                }`}>
                  {selectedClient.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Contacto principal: <span className="text-slate-800">{selectedClient.contactName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Servicios Activos</span>
              <span className="text-xl font-black text-slate-800 flex items-center md:justify-end gap-1.5 mt-1">
                <Layers className="w-4 h-4 text-[#1d63ff]" />
                {selectedClient.services} contratados
              </span>
            </div>
            <div className="text-left md:text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Próxima Renovación</span>
              <span className="text-xl font-black text-slate-800 flex items-center md:justify-end gap-1.5 mt-1 font-mono">
                <Calendar className="w-4 h-4 text-[#f59e0b]" />
                {selectedClient.nextRenewal}
              </span>
            </div>
          </div>
        </div>

        {/* Inner Bento Section and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Account specifications & Assigned Responsible */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Información de Enlace
              </h3>
              
              <div className="space-y-4 font-semibold text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Correo Corporativo</span>
                    <a href={`mailto:${selectedClient.email}`} className="text-slate-800 hover:text-[#1d63ff] font-mono mt-0.5 block truncate">
                      {selectedClient.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Línea Telefónica</span>
                    <span className="text-slate-800 font-mono mt-0.5 block">
                      {selectedClient.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Ejecutivo Responsable</span>
                    <span className="text-[#1d63ff] font-black mt-0.5 block">
                      {selectedClient.responsible}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Estatus de Relación</span>
                    <span className="text-emerald-500 font-bold mt-0.5 block flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Cuenta Sincronizada
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Notes / CRM Internal metadata */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Notas de Bitácora
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Auto Guardado</span>
              </div>
              <textarea 
                className="w-full h-32 p-3 bg-slate-50 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#1d63ff]/5 border border-slate-100 focus:border-blue-500 text-slate-700 leading-relaxed resize-none"
                placeholder="Escribe comentarios, requerimientos específicos de diseño, o minutas de juntas telefónicas con este cliente..."
                defaultValue={`Reunión de kickoff completada. El cliente prefiere diseño minimalista con tipografías sans-serif muy marcadas. Solicita replicar el Bento Layout con animaciones de entrada suaves.`}
              />
            </div>
          </div>

          {/* Right Column: Interactive Details / Action items */}
          <div className="lg:col-span-8 space-y-6">
            {/* Service packages list mimicking Figma style */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Servicios Contratados ({selectedClient.services})
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Suscripciones activas de diseño y hosting.</p>
                </div>
                <button className="px-3 py-1.5 bg-[#e6efff] hover:bg-[#1d63ff]/10 text-[#1d63ff] font-extrabold text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Agregar Servicio
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Póliza de Diseño Mensual UX/UI", price: "$12,500 MXN / mes", badge: "Diseño", details: "Entregables quincenales, prototipado interactivo en Figma" },
                  { name: "Mantenimiento & Hosting Pro", price: "$2,800 MXN / mes", badge: "Dev & Cloud", details: "Respaldo diario en Google Cloud, SSL Premium, CDN activo" },
                  { name: "Soporte Técnico VIP y Consultas", price: "$4,500 MXN / mes", badge: "Soporte", details: "Atención prioritaria 24/7 y resolución en menos de 2 horas" }
                ].slice(0, selectedClient.services).map((srv, idx) => (
                  <div key={idx} className="flex justify-between items-start p-3.5 bg-slate-50/70 border border-slate-200/30 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800">{srv.name}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white text-slate-400 border border-slate-100 rounded-md">
                          {srv.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">{srv.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-slate-800 block">{srv.price}</span>
                      <span className="text-[10px] font-bold text-[#00b289] mt-0.5 block">● Activo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Credentials Vault for this customer */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00b289]" />
                    Credenciales de Despliegue
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Accesos seguros protegidos por cifrado local AES-256.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { title: "Panel Web Host", url: "https://host.agencia.mx", user: "admin_murillo", pass: "••••••••••••••••" },
                  { title: "Servidor SFTP / SSH", url: "ssh.constructoramurillo.mx", user: "dev_user_prod", pass: "••••••••••••••••" }
                ].map((cred, i) => (
                  <div key={i} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/30 text-xs font-semibold text-slate-600 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200/40 pb-1.5">
                      <span className="font-black text-slate-800 text-xs">{cred.title}</span>
                      <a href="#link" className="text-[#1d63ff] hover:underline flex items-center gap-1 text-[10px]">
                        Conectar <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-bold">Usuario</span>
                      <code className="text-slate-800 font-mono text-[10px]">{cred.user}</code>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-bold">Contraseña</span>
                      <div className="flex items-center justify-between">
                        <code className="text-slate-800 font-mono text-[10px]">{cred.pass}</code>
                        <button className="text-[10px] font-black text-[#1d63ff] hover:underline cursor-pointer">
                          Ver / Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal for editing selected client info */}
        {editingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#1d63ff]" />
                  <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">Editar Información de Cliente</h3>
                </div>
                <button 
                  onClick={() => setEditingClient(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1.5">Empresa</label>
                    <input
                      type="text"
                      required
                      value={editingClient.companyName}
                      onChange={(e) => setEditingClient({ ...editingClient, companyName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1.5">Contacto Principal</label>
                    <input
                      type="text"
                      required
                      value={editingClient.contactName}
                      onChange={(e) => setEditingClient({ ...editingClient, contactName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1.5">Correo Electrónico</label>
                      <input
                        type="email"
                        value={editingClient.email}
                        onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5">Teléfono</label>
                      <input
                        type="text"
                        value={editingClient.phone}
                        onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1.5">Ejecutivo Responsable</label>
                      <input
                        type="text"
                        value={editingClient.responsible}
                        onChange={(e) => setEditingClient({ ...editingClient, responsible: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5">Próxima Renovación</label>
                      <input
                        type="date"
                        value={editingClient.nextRenewal}
                        onChange={(e) => setEditingClient({ ...editingClient, nextRenewal: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1.5">Servicios Contratados</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editingClient.services}
                        onChange={(e) => setEditingClient({ ...editingClient, services: Number(e.target.value) || 1 })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5">Estado</label>
                      <select
                        value={editingClient.status}
                        onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Próximo a vencer">Próximo a vencer</option>
                        <option value="Vencido">Vencido</option>
                        <option value="Suspendido">Suspendido</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#1d63ff] hover:bg-blue-600 text-white font-extrabold rounded-xl shadow-lg shadow-[#1d63ff]/10 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-extrabold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view (Exactly matching the user's screenshots)
  return (
    <div className="space-y-5 animate-fade-in text-left">
      
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1d63ff]" />
            Clientes en Sistema
          </h2>
          <p className="text-xs text-slate-500">Módulo réplica del diseño y lógica de Figma.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-md shadow-[#1d63ff]/10 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      {/* 2. Unified Search and Dropdown Filter Row (Exactly matching design) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input Box */}
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-4 py-2 text-[11px] font-semibold bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-slate-700 shadow-xs"
          />
        </div>

        {/* Status Dropdown Picker Selector */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="pl-3.5 pr-8 py-2 bg-white border border-slate-200/80 rounded-xl text-[11px] font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-xs cursor-pointer appearance-none min-w-[110px]"
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Próximo a vencer">Próximo a vencer</option>
            <option value="Vencido">Vencido</option>
            <option value="Suspendido">Suspendido</option>
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </span>
        </div>
      </div>

      {/* 3. High-fidelity Horizontal Scrollable Table Wrapper */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs font-semibold">
            <thead className="bg-slate-50/75 border-b border-slate-200/60">
              <tr>
                <th className="py-4 px-5 text-[10px] font-black uppercase tracking-wider text-slate-400">Cliente</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Contacto</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Teléfono</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Correo</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Servicios</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Responsable</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Estado</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Próx. Renovación</th>
                <th className="py-4 px-5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-extrabold text-sm text-slate-600">No se encontraron clientes</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Revisa el término de búsqueda o cambia tus filtros.</p>
                  </td>
                </tr>
              ) : (
                currentClients.map((client) => (
                  <tr 
                    key={client.id}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => handleSelect(client)}
                  >
                    {/* CLIENT COLUMN */}
                    <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                      <div 
                        className="flex items-center gap-3.5"
                        onClick={() => handleSelect(client)}
                      >
                        <div className={`w-9 h-9 rounded-full ${client.avatarBg} text-white flex items-center justify-center font-extrabold text-[12px] uppercase shrink-0 shadow-sm`}>
                          {client.avatarInitials}
                        </div>
                        <span className="font-black text-slate-800 hover:text-[#1d63ff] transition-colors leading-tight">
                          {client.companyName}
                        </span>
                      </div>
                    </td>
                    
                    {/* CONTACT COLUMN */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {client.contactName}
                    </td>
                    
                    {/* PHONE COLUMN */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {client.phone}
                    </td>
                    
                    {/* EMAIL COLUMN */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {client.email}
                    </td>
                    
                    {/* SERVICES COLUMN */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-[#e6efff] text-[#1d63ff] flex items-center justify-center font-extrabold text-[11px]">
                          {client.services}
                        </span>
                      </div>
                    </td>
                    
                    {/* RESPONSIBLE COLUMN */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {client.responsible}
                    </td>
                    
                    {/* STATUS PILL BADGE COLUMN */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <span className={`px-3.5 py-1 rounded-full text-[10px] font-black tracking-wide border uppercase min-w-[95px] text-center ${
                          client.status === "Activo" ? "bg-[#eafaf1] text-[#00b289] border-[#d2f6e4]" :
                          client.status === "Próximo a vencer" ? "bg-[#fff8eb] text-[#f59e0b] border-[#ffe9cc]" :
                          client.status === "Vencido" ? "bg-[#fef2f2] text-[#ef4444] border-[#fee2e2]" :
                          "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]"
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </td>

                    {/* NEXT RENEWAL COLUMN */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono font-medium text-[11px]">
                      {client.nextRenewal}
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleSelect(client)}
                          className="p-1 text-slate-400 hover:text-[#1d63ff] hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver Ficha del Cliente"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingClient(client)}
                          className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la cuenta de ${client.companyName}?`)) {
                              onDeleteClient(client.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Elegant scrollbar and pagination footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
          <span className="text-[11px] font-bold text-slate-400">
            {filteredClients.length} clientes en total
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-slate-600 transition-all font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-center flex items-center justify-center font-black transition-all cursor-pointer ${
                    currentPage === page 
                      ? "bg-[#1d63ff] text-white shadow-xs" 
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg text-slate-600 transition-all font-extrabold flex items-center gap-1 cursor-pointer"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up text-left">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1d63ff]" />
                <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">Registrar Nuevo Cliente</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">Nombre de la Empresa</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="ej. Constructora Murillo S.A."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5">Representante o Contacto</label>
                  <input
                    type="text"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="ej. Ing. Roberto Murillo"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1.5">Correo Electrónico</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="r.murillo@constructora.mx"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Teléfono</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+52 664 234 5678"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1.5">Responsable Asignado</label>
                    <select
                      value={newResponsible}
                      onChange={(e) => setNewResponsible(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-slate-700 cursor-pointer"
                    >
                      <option value="Carlos Mendoza">Carlos Mendoza</option>
                      <option value="Sofía Rodríguez">Sofía Rodríguez</option>
                      <option value="Luis Pérez">Luis Pérez</option>
                      <option value="Marco Herrera">Marco Herrera</option>
                      <option value="Valeria Castro">Valeria Castro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Próxima Renovación</label>
                    <input
                      type="date"
                      value={newRenewal}
                      onChange={(e) => setNewRenewal(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1.5">Servicios Iniciales</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newServices}
                      onChange={(e) => setNewServices(Number(e.target.value) || 1)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-mono text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Estado de Cuenta</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-slate-700 cursor-pointer"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Próximo a vencer">Próximo a vencer</option>
                      <option value="Vencido">Vencido</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1d63ff] hover:bg-blue-600 text-white font-extrabold rounded-xl shadow-lg shadow-[#1d63ff]/10 transition-all cursor-pointer"
                >
                  Guardar Cuenta
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-extrabold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
