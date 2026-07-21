import React,{useEffect,useState} from "react";
import {Bell,Building2,Globe2,Save,Shield,UsersRound} from "lucide-react";
import {apiFetch} from "../lib/api";

type Settings={companyName:string;rfc:string;email:string;phone:string;city:string;country:string;systemNotifications:boolean;emailAlerts:boolean;overduePayments:boolean;upcomingRenewals:boolean;delayedProjects:boolean;newLeads:boolean;currency:string;timezone:string;language:string;dateFormat:string;sessionTimeout:number;twoFactor:boolean};
type PermissionEntry={roleKey:string;moduleName:string;actionName:string;allowed:boolean|number};

const defaults:Settings={companyName:"Designs Agency S.A. de C.V.",rfc:"DAG240115TJ1",email:"hola@designs.mx",phone:"+52 664 123 4567",city:"Tijuana, Baja California",country:"México",systemNotifications:true,emailAlerts:true,overduePayments:true,upcomingRenewals:true,delayedProjects:true,newLeads:true,currency:"MXN",timezone:"America/Tijuana",language:"es-MX",dateFormat:"DD/MM/YYYY",sessionTimeout:10,twoFactor:false};
const roles=[{key:"admin_general",label:"Admin General"},{key:"administracion",label:"Administración"},{key:"gerente_dev",label:"Gerente Dev"},{key:"gerente_web",label:"Gerente Web"}];
const modules=[
  ["clients","Clientes"],["leads","Prospectos"],["services","Servicios"],["billing","Pagos"],
  ["renewals","Renovaciones"],["quotes","Cotizaciones"],["projects","Proyectos Dev"],["projects_web","Proyectos Web"],
  ["kanban","Kanban"],["tasks","Tareas"],["staff","Personal"],["credentials","Credenciales"],
  ["reports","Reportes"],["users","Usuarios"],["settings","Configuración"]
] as const;
const actions=[{key:"view",label:"Ver"},{key:"create",label:"Crear"},{key:"edit",label:"Editar"},{key:"delete",label:"Eliminar"},{key:"export",label:"Exportar"}] as const;

const Field=({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void})=><label><span className="mb-1 block text-[10px] font-bold uppercase text-[#58708f]">{label}</span><input value={value} onChange={(event)=>onChange(event.target.value)} className="h-[34px] w-full rounded-lg border border-[#d8e0eb] bg-[#f8fafc] px-3 text-[11px] text-slate-800 outline-none focus:border-blue-500 focus:bg-white"/></label>;
const Toggle=({checked,onChange}:{checked:boolean;onChange:(value:boolean)=>void})=><button type="button" onClick={()=>onChange(!checked)} className={`relative h-[14px] w-[21px] rounded-full border-2 ${checked?"border-blue-600 bg-blue-600":"border-slate-300 bg-slate-300"}`}><i className={`absolute top-[1px] h-[8px] w-[8px] rounded-full bg-white transition-all ${checked?"left-[9px]":"left-[1px]"}`}/></button>;

export default function CRMSettings(){
  const [settings,setSettings]=useState(defaults);
  const [permissions,setPermissions]=useState<PermissionEntry[]>([]);
  const [selectedRole,setSelectedRole]=useState("administracion");
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    Promise.all([
      apiFetch<{settings:Settings}>("/api/settings"),
      apiFetch<{permissions:PermissionEntry[]}>("/api/permissions")
    ]).then(([settingsResponse,permissionsResponse])=>{
      setSettings({...defaults,...settingsResponse.settings});
      setPermissions(permissionsResponse.permissions);
    }).catch((error)=>console.error("No se pudo cargar la configuración",error));
  },[]);

  const set=<K extends keyof Settings>(key:K,value:Settings[K])=>setSettings((current)=>({...current,[key]:value}));
  const permissionValue=(roleKey:string,moduleName:string,actionName:string)=>Boolean(permissions.find((item)=>item.roleKey===roleKey&&item.moduleName===moduleName&&item.actionName===actionName)?.allowed);
  const togglePermission=(moduleName:string,actionName:string)=>{
    if(selectedRole==="admin_general"||actionName==="delete")return;
    setPermissions((current)=>current.map((item)=>item.roleKey===selectedRole&&item.moduleName===moduleName&&item.actionName===actionName?{...item,allowed:!Boolean(item.allowed)}:item));
  };
  const save=async()=>{
    setSaving(true);
    try{
      await Promise.all([
        apiFetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)}),
        apiFetch("/api/permissions",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({permissions})})
      ]);
      setSaved(true);setTimeout(()=>setSaved(false),1800);
    }finally{setSaving(false)}
  };

  return <form onSubmit={(event)=>{event.preventDefault();void save()}} className="-mt-1 space-y-3 text-left text-[11px] animate-fade-in">
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-xs font-bold"><Building2 className="h-4 w-4 text-blue-600"/>Información de la empresa</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Nombre empresa" value={settings.companyName} onChange={(value)=>set("companyName",value)}/><Field label="RFC" value={settings.rfc} onChange={(value)=>set("rfc",value)}/><Field label="Correo corporativo" value={settings.email} onChange={(value)=>set("email",value)}/><Field label="Teléfono" value={settings.phone} onChange={(value)=>set("phone",value)}/><Field label="Ciudad" value={settings.city} onChange={(value)=>set("city",value)}/><Field label="País" value={settings.country} onChange={(value)=>set("country",value)}/></div></section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-xs font-bold"><Shield className="h-4 w-4 text-blue-600"/>Seguridad y sesión</h2><p className="mb-2 text-[10px] font-bold uppercase text-[#58708f]">Tiempo de inactividad antes de cerrar sesión</p><div className="flex items-center gap-3"><input type="range" min="5" max="60" step="5" value={settings.sessionTimeout} onChange={(event)=>set("sessionTimeout",Number(event.target.value))} className="crm-progress w-full accent-blue-600"/><b className="flex h-12 w-14 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-center text-blue-700">{settings.sessionTimeout}<br/>min</b></div></section>
      </div>
      <div className="space-y-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-xs font-bold"><Bell className="h-4 w-4 text-blue-600"/>Notificaciones</h2>{[["Notificaciones en sistema","systemNotifications"],["Alertas por correo","emailAlerts"]].map(([label,key])=><div key={key} className="flex h-12 items-center justify-between border-b border-slate-100 text-slate-600"><span>{label}</span><Toggle checked={settings[key as keyof Settings] as boolean} onChange={(value)=>set(key as keyof Settings,value as never)}/></div>)}</section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-xs font-bold"><Globe2 className="h-4 w-4 text-blue-600"/>Preferencias</h2><label className="mb-3 block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#58708f]">Moneda</span><select value={settings.currency} onChange={(event)=>set("currency",event.target.value)} className="h-[35px] w-full rounded-lg border border-[#d8e0eb] bg-[#f8fafc] px-3"><option value="MXN">MXN – Peso Mexicano</option><option value="USD">USD – Dólar estadounidense</option></select></label></section>
      </div>
    </div>

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xs font-bold"><UsersRound className="h-4 w-4 text-blue-600"/>Permisos por rol</h2><p className="mt-1 text-[10px] text-slate-400">Administra qué puede consultar y modificar cada rol. La eliminación permanece reservada para Admin General.</p></div><div className="flex flex-wrap gap-2">{roles.map((role)=><button type="button" key={role.key} onClick={()=>setSelectedRole(role.key)} className={`rounded-lg border px-3 py-2 text-[10px] font-bold ${selectedRole===role.key?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-500"}`}>{role.label}</button>)}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr className="bg-slate-50 text-left text-[10px] uppercase text-slate-500"><th className="rounded-l-lg px-4 py-3">Módulo</th>{actions.map((action)=><th key={action.key} className="px-4 py-3 text-center">{action.label}</th>)}</tr></thead><tbody>{modules.map(([moduleName,label])=><tr key={moduleName} className={`border-t border-slate-100 ${moduleName==="quotes"?"bg-orange-50/40":""}`}><td className="px-4 py-3"><b className="text-slate-700">{label}</b>{moduleName==="quotes"&&<span className="ml-2 rounded bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-700">Admin / Administración</span>}</td>{actions.map((action)=>{const disabled=selectedRole==="admin_general"||action.key==="delete";return <td key={action.key} className="px-4 py-3 text-center"><input type="checkbox" checked={permissionValue(selectedRole,moduleName,action.key)} disabled={disabled} onChange={()=>togglePermission(moduleName,action.key)} className="h-4 w-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"/></td>})}</tr>)}</tbody></table></div>
    </section>
    <div className="flex justify-end"><button disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#2463eb] px-5 py-2.5 font-bold text-white shadow-sm disabled:opacity-60"><Save className="h-4 w-4"/>{saving?"Guardando...":saved?"Cambios guardados":"Guardar cambios"}</button></div>
  </form>;
}
