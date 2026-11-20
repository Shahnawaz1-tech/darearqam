import type { StudyHours } from '@/types/student-dashboard';
export function HoursChart({data}:{data:StudyHours}) {
 const max=Math.max(...data.days.map(d=>d.value),1);
 return <div><div className="mt-4 flex h-44 items-end gap-2" role="img" aria-label={`Study hours this week ${data.thisWeek}, last week ${data.lastWeek}`}>{data.days.map(day=><div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full rounded-t-md bg-[var(--info)]" style={{height:`${Math.max(8,(day.value/max)*80)}%`}} title={`${day.label}: ${day.value} hours`}/><span className="text-[10px] text-slate-500">{day.label}</span></div>)}</div><div className="mt-3 flex gap-2 text-[10px]"><span className="rounded-full bg-sky-50 px-2 py-1 text-sky-700">This week {data.thisWeek}h</span><span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Last week {data.lastWeek}h</span></div></div>
}
