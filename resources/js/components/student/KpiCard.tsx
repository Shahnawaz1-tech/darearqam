import type { LucideIcon } from 'lucide-react';
export function KpiCard({icon:Icon,label,value,detail,color}:{icon:LucideIcon;label:string;value:string|number;detail:string;color:string}) {
 return <article className="rounded-xl border border-[var(--card-border)] bg-white p-4 shadow-[var(--subtle-shadow)]"><div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full" style={{background:`${color}18`,color}}><Icon className="size-5"/></span><div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs" style={{color}}>{detail}</p></div></div></article>
}
