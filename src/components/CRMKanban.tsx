import React, { useState } from "react";
import { Search, Layers, Calendar, ArrowRight } from "lucide-react";

type KanbanCard = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  progress?: number;
  statusLabel?: string;
  date: string;
  initials: string;
  badge?: string;
};

type KanbanColumn = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

type KanbanBoard = {
  id: string;
  label: string;
  columns: KanbanColumn[];
};

const kanbanBoards: KanbanBoard[] = [
  {
    id: "comercial",
    label: "Comercial",
    columns: [
      {
        id: "nuevo",
        title: "Nuevo",
        cards: [
          {
            id: "c_1",
            title: "AutoPartes del Norte",
            subtitle: "Prospecto",
            tags: ["E-commerce"],
            date: "01-29",
            initials: "D",
            badge: "Media"
          },
          {
            id: "c_2",
            title: "Clínica Dental Sonrisa",
            subtitle: "Prospecto",
            tags: ["Landing"],
            date: "02-05",
            initials: "D",
            badge: "Media"
          }
        ]
      },
      {
        id: "contactado",
        title: "Contactado",
        cards: [
          {
            id: "c_3",
            title: "Bufete Garza & Asoc.",
            subtitle: "Prospecto",
            tags: ["Web"],
            date: "01-22",
            initials: "D",
            badge: "Alta"
          }
        ]
      },
      {
        id: "reunion",
        title: "Reunión Agendada",
        cards: [
          {
            id: "c_4",
            title: "Constructora Pedraza",
            subtitle: "Prospecto",
            tags: ["Portal", "Dev"],
            date: "01-18",
            initials: "C",
            badge: "Alta"
          }
        ]
      },
      {
        id: "cotizacion",
        title: "Cotización Enviada",
        cards: [
          {
            id: "c_5",
            title: "Distrib. Central GDL",
            subtitle: "Prospecto",
            tags: ["E-commerce"],
            date: "01-23",
            initials: "D",
            badge: "Alta"
          }
        ]
      },
      {
        id: "seguimiento",
        title: "Seguimiento",
        cards: [
          {
            id: "c_6",
            title: "Esc. Montessori Cima",
            subtitle: "Prospecto",
            tags: ["LMS", "Web"],
            date: "01-28",
            initials: "S",
            badge: "Media"
          }
        ]
      },
      {
        id: "ganado",
        title: "Ganado",
        cards: [
          {
            id: "c_7",
            title: "Bufete Garza & Asoc.",
            subtitle: "Nuevo cliente",
            tags: ["Web"],
            date: "01-04",
            initials: "D",
            badge: "Alta"
          }
        ]
      },
      {
        id: "perdido",
        title: "Perdido",
        cards: [
          {
            id: "c_8",
            title: "Rest. La Hacienda",
            subtitle: "Excelente",
            tags: ["Landing"],
            date: "12-25",
            initials: "D",
            badge: "Baja"
          }
        ]
      }
    ]
  },
  {
    id: "desarrollo",
    label: "Desarrollo",
    columns: [
      {
        id: "pendiente",
        title: "Pendiente",
        cards: [
          {
            id: "d_1",
            title: "Módulo Inventario",
            subtitle: "Constructora Murillo",
            tags: ["Backend"],
            date: "02-01",
            initials: "L",
            badge: "Alta"
          }
        ]
      },
      {
        id: "planeacion",
        title: "Planeación",
        cards: [
          {
            id: "d_2",
            title: "Módulo Cotizaciones",
            subtitle: "Constructora Murillo",
            tags: ["Full-stack"],
            date: "04-10",
            initials: "C",
            badge: "Media"
          }
        ]
      },
      {
        id: "en-desarrollo",
        title: "En Desarrollo",
        cards: [
          {
            id: "d_3",
            title: "Portal Inmobiliario v2",
            subtitle: "Grupo Arenas",
            tags: ["React", "Node"],
            date: "02-28",
            initials: "M",
            badge: "Alta"
          },
          {
            id: "d_4",
            title: "E-commerce Farmacia",
            subtitle: "Farmacia San Pablo",
            tags: ["WooCommerce"],
            date: "03-31",
            initials: "C",
            badge: "Alta"
          }
        ]
      },
      {
        id: "qa",
        title: "En Pruebas",
        cards: [
          {
            id: "d_5",
            title: "Sistema Reservas Hotel",
            subtitle: "Hotel Riviera Maya",
            tags: ["Testing"],
            date: "01-31",
            initials: "A",
            badge: "Urgente"
          }
        ]
      },
      {
        id: "revision",
        title: "En Revisión",
        cards: [
          {
            id: "d_6",
            title: "CRM Distribuidora",
            subtitle: "Distrib. Noroeste",
            tags: ["CRM"],
            date: "01-15",
            initials: "M",
            badge: "Urgente"
          }
        ]
      },
      {
        id: "entregado",
        title: "Cerrado",
        cards: [
          {
            id: "d_7",
            title: "Landing Taller Express",
            subtitle: "Taller Express TJ",
            tags: ["Landing"],
            date: "12-15",
            initials: "L",
            badge: "Baja"
          }
        ]
      }
    ]
  },
  {
    id: "paginas-web",
    label: "Páginas web",
    columns: [
      {
        id: "info",
        title: "Pendiente Información",
        cards: [
          {
            id: "w_1",
            title: "Portal Academia Luminar",
            subtitle: "Academia Luminar",
            tags: ["LMS"],
            date: "03-05",
            initials: "S",
            badge: "Media"
          }
        ]
      },
      {
        id: "diseno",
        title: "Diseño",
        cards: [
          {
            id: "w_2",
            title: "Portafolio Taller Express",
            subtitle: "Taller Automotriz",
            tags: ["Diseño"],
            date: "01-30",
            initials: "V",
            badge: "Baja"
          }
        ]
      },
      {
        id: "maquetacion",
        title: "Maquetación",
        cards: [
          {
            id: "w_3",
            title: "Portafolio Taller Express",
            subtitle: "Taller Automotriz",
            tags: ["HTML", "CSS"],
            date: "01-30",
            initials: "L",
            badge: "Baja"
          }
        ]
      },
      {
        id: "contenido",
        title: "Carga de Contenido",
        cards: [
          {
            id: "w_4",
            title: "Landing El Fogón Real",
            subtitle: "Rest. El Fogón",
            tags: ["Contenido"],
            date: "02-01",
            initials: "L",
            badge: "Media"
          }
        ]
      },
      {
        id: "revision-cliente",
        title: "Revisión Cliente",
        cards: [
          {
            id: "w_5",
            title: "Sitio Clínica Médica",
            subtitle: "Clínica del Valle",
            tags: ["Revisión"],
            date: "01-25",
            initials: "S",
            badge: "Alta"
          }
        ]
      },
      {
        id: "publicado",
        title: "Publicado",
        cards: [
          {
            id: "w_6",
            title: "Web Despacho Montoya",
            subtitle: "Desp. Montoya",
            tags: ["Publicado"],
            date: "01-10",
            initials: "L",
            badge: "Baja"
          }
        ]
      },
      {
        id: "cerrado",
        title: "Cerrado",
        cards: []
      }
    ]
  },
  {
    id: "administrativo",
    label: "Administrativo",
    columns: [
      {
        id: "pendiente-adm",
        title: "Pendiente",
        cards: [
          {
            id: "a_1",
            title: "Cobro Distrib. Noroeste",
            subtitle: "Distrib. Noroeste",
            tags: ["Cobranza"],
            date: "01-15",
            initials: "J",
            badge: "Urgente"
          },
          {
            id: "a_2",
            title: "Renovar dominio Montoya",
            subtitle: "Desp. Montoya",
            tags: ["Dominio"],
            date: "01-15",
            initials: "C",
            badge: "Urgente"
          }
        ]
      },
      {
        id: "en-proceso",
        title: "En Proceso",
        cards: [
          {
            id: "a_3",
            title: "Facturar pago Hotel Riviera",
            subtitle: "Hotel Riviera Maya",
            tags: ["Facturación"],
            date: "01-20",
            initials: "J",
            badge: "Alta"
          }
        ]
      },
      {
        id: "esperando-cliente",
        title: "Esperando Cliente",
        cards: [
          {
            id: "a_4",
            title: "Renovación Farmacia San Pablo",
            subtitle: "Farmacia San Pablo",
            tags: ["Hosting"],
            date: "01-20",
            initials: "S",
            badge: "Urgente"
          }
        ]
      },
      {
        id: "pagado",
        title: "Pagado / Renovado",
        cards: [
          {
            id: "a_5",
            title: "Hosting Constructora Murillo",
            subtitle: "Constructora Murillo",
            tags: ["Hosting"],
            date: "01-18",
            initials: "C",
            badge: "Alta"
          }
        ]
      },
      {
        id: "vencido",
        title: "Vencido",
        cards: [
          {
            id: "a_6",
            title: "Hosting Distrib. Noroeste",
            subtitle: "Distrib. Noroeste",
            tags: ["Urgente"],
            date: "12-20",
            initials: "M",
            badge: "Urgente"
          }
        ]
      },
      {
        id: "cerrado-adm",
        title: "Cerrado",
        cards: []
      }
    ]
  }
];

const badgeColor = (badge?: string) => {
  switch (badge) {
    case "Alta":
      return "bg-amber-50 border-amber-100 text-amber-700";
    case "Media":
      return "bg-sky-50 border-sky-100 text-sky-700";
    case "Baja":
      return "bg-stone-100 border-stone-200 text-stone-600";
    case "Urgente":
      return "bg-rose-50 border-rose-100 text-rose-700";
    default:
      return "bg-slate-100 border-slate-200 text-slate-600";
  }
};

const progressClass = (progress?: number) => {
  if (progress === undefined) return "bg-slate-200";
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-blue-500";
  return "bg-indigo-500";
};

const progressColor = (progress?: number) => {
  if (progress === undefined) return "#e6eef8";
  if (progress >= 80) return "#10b981"; // emerald-500
  if (progress >= 50) return "#3b82f6"; // blue-500
  return "#6366f1"; // indigo-500
};

export default function CRMKanban() {
  const [activeBoardId, setActiveBoardId] = useState("comercial");
  const activeBoard = kanbanBoards.find((board) => board.id === activeBoardId) ?? kanbanBoards[0];

  return (
    <div className="space-y-4 animate-fade-in w-full">
      {/* Compact header: title, small search, icons (single row ~64px) */}
      <div className="flex items-center justify-between h-16 w-full">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-extrabold text-slate-900">Tablero Kanban</h2>
        </div>

        <div className="flex-1 flex justify-center px-6">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-3 h-10 rounded-full border border-slate-200 bg-white text-sm text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">AG</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-sm">
        {/* Compact tabs row with counter on the right */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-4">
            {kanbanBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setActiveBoardId(board.id)}
                className={`text-sm font-semibold pb-2 transition-colors ${activeBoardId === board.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {board.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-slate-500 font-semibold">{activeBoard.columns.reduce((s, c) => s + c.cards.length, 0)} tarjetas</div>
        </div>

        {/* Board: horizontal columns, narrower and compact cards */}
        <div className="p-4">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {activeBoard.columns.map((column) => (
              <div key={column.id} className="flex-none w-[240px] rounded-lg border border-slate-200/70 bg-slate-50/80 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{column.title}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">{column.cards.length} tarjeta{column.cards.length === 1 ? '' : 's'}</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5">{column.cards.length}</span>
                </div>

                <div className="space-y-3">
                  {column.cards.map((card) => (
                    <article key={card.id} className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      {/* priority badge top-right */}
                      {card.badge && (
                        <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor(card.badge)}`}>{card.badge}</span>
                      )}

                      <div>
                        {/* thin progress bar above tags when present */}
                        {card.progress !== undefined && (
                          <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-2">
                            <div
                              className={`h-full`}
                              style={{ width: `${card.progress}%`, backgroundColor: progressColor(card.progress) }}
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{card.title}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{card.subtitle}</p>
                          </div>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-600">{card.initials}</div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {card.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-600">{card.initials}</div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <button className="w-6 h-6 rounded-full hover:bg-slate-100">&lt;</button>
                            <button className="w-6 h-6 rounded-full hover:bg-slate-100">&gt;</button>
                          </div>
                        </div>

                        <div>{card.date}</div>
                      </div>
                    </article>
                  ))}

                  <div className="h-36 rounded-xl border border-dashed border-slate-300 bg-white/80 flex items-center justify-center text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500 cursor-pointer">
                    + Agregar tarjeta
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
