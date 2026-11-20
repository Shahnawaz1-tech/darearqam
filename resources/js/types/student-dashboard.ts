export type Lang = 'en' | 'ur';
export interface Kpis { average:number; grade:string; averageTrend:string|null; todayClasses:number; nextClassMinutes:number|null; dueHomework:number; overdueHomework:number; points:number; rank:number|null }
export interface Course { id:number; title:string; teacher:string; cover:string|null; tags:string[]; progress:number }
export interface Upcoming { id:number; subject:string; topic:string|null; time:string; teacher:string; room:string|null; liveUrl:string|null }
export interface Homework { id:number; title:string; description:string|null; dueAt:string; attachment:string|null; status:'pending'|'submitted'|'late'|'graded'; submitted:boolean; text:string|null; file:string|null; marks:number|null; feedback:string|null }
export interface StudyDay { label:string; value:number }
export interface StudyHours { thisWeek:number; lastWeek:number; days:StudyDay[] }
export interface Attendance { percent:number; present:number; absent:number; total:number; trend:'consistent'|'dropping' }
export interface Thread { id:number; title:string|null; tag:'question'|'answer'|'notice'; author:string; avatar:string|null; relativeTime:string; message:string }
export interface Fee { month:string; amount:number; paid:number; balance:number; dueDate:string|null; overdue:boolean }
export interface SubjectResult { name:string; marks:number; total:number }
export interface LatestResult { examId:number; title:string; percentage:number; grade:string; position:number|null; subjects:SubjectResult[] }
export interface Exam { id:number; title:string; date:string|null }
export interface HifzEntry { date?:string; type:'sabaq'|'sabqi'|'manzil'; from:string; to:string; rating:'excellent'|'good'|'needs_work'; remarks?:string|null }
export interface Hifz { parasDone:number; today:HifzEntry[]; recent:HifzEntry[] }
export interface Remark { category:'behaviour'|'cleanliness'|'punctuality'; body:string; date:string }
export interface Leave { id:number; from:string; to:string; reason:string; status:'pending'|'approved'|'rejected' }
export interface Resource { id:number; category:string; title:string; file:string }
export interface StudentDashboardProps extends Record<string, unknown> {
 kpis:Kpis; courses:Course[]; upcoming:Upcoming[]; homework:Homework[]; studyHours:StudyHours;
 attendance:Attendance; threads:Thread[]; fees:Fee; latestResult:LatestResult|null; upcomingExams:Exam[];
 hifz:Hifz; remarks:Remark[]; leave:Leave[]; points:{total:number;rank:number|null;badges:string[]};
 notices:{id:number;title:string;body:string|null;type:string;publishedAt:string|null}[];
 resources:Resource[]; prayer:{hijri:string;times:{name:string;time:string}[]};
}
