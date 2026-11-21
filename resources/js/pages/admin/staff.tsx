import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, UserRound, X } from 'lucide-react';
import { useState } from 'react';

type StaffMember = {
    id: number;
    name: string;
    email: string;
    role: 'staff' | 'member';
    class_ids: number[];
};

type ClassOption = {
    id: number;
    name: string;
    type: string;
    session: string;
};

type Props = {
    staff: StaffMember[];
    classes: ClassOption[];
};

export default function StaffPage({ staff, classes }: Props) {
    const [editing, setEditing] = useState<StaffMember | null>(null);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'staff' | 'member'>('staff');
    const [classIds, setClassIds] = useState<number[]>([]);

    const openCreate = () => {
        setEditing(null);
        setName('');
        setEmail('');
        setPassword('');
        setRole('staff');
        setClassIds([]);
        setCreating(true);
    };

    const openEdit = (member: StaffMember) => {
        setCreating(false);
        setEditing(member);
        setName(member.name);
        setEmail(member.email);
        setRole(member.role);
        setClassIds(member.class_ids);
    };

    const toggleClass = (classId: number) => {
        setClassIds((current) => current.includes(classId)
            ? current.filter((id) => id !== classId)
            : [...current, classId]);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (editing) {
            router.patch(`/admin/staff/${editing.id}`, { name, email, role, class_ids: classIds });
        } else {
            router.post('/admin/staff', { name, email, password, class_ids: classIds });
        }
        setCreating(false);
        setEditing(null);
    };

    return (
        <>
            <Head title="Teachers" />
            <main className="p-4 sm:p-6">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">People & access</p>
                            <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
                        </div>
                        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white">
                            <Plus className="size-4" /> Add teacher
                        </button>
                    </div>

                    {(creating || editing) && (
                        <form onSubmit={submit} className="mb-5 rounded-xl border border-violet-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-800">{editing ? 'Edit teacher' : 'Add teacher'}</h2>
                                <button type="button" aria-label="Close" onClick={() => { setCreating(false); setEditing(null); }}><X className="size-5 text-slate-400" /></button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <label className="text-xs font-medium text-slate-600">Name
                                    <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded-md border px-3 text-sm" />
                                </label>
                                <label className="text-xs font-medium text-slate-600">Email
                                    <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-10 w-full rounded-md border px-3 text-sm" />
                                </label>
                                {creating && <label className="text-xs font-medium text-slate-600">Password
                                    <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-md border px-3 text-sm" />
                                </label>}
                                <label className="text-xs font-medium text-slate-600">Role
                                    <select value={role} onChange={(event) => setRole(event.target.value as 'staff' | 'member')} className="mt-1 h-10 w-full rounded-md border px-3 text-sm">
                                        <option value="staff">Staff / Teacher</option>
                                        <option value="member">Member</option>
                                    </select>
                                </label>
                            </div>
                            <fieldset className="mt-4">
                                <legend className="mb-2 text-xs font-semibold text-slate-600">Assigned classes</legend>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {classes.map((item) => (
                                        <label key={item.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-700">
                                            <input type="checkbox" checked={classIds.includes(item.id)} onChange={() => toggleClass(item.id)} />
                                            {item.name}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <button type="submit" className="mt-5 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white">Save assignments</button>
                        </form>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr><th className="px-4 py-3">Teacher</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Assigned classes</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody>
                                {staff.map((member) => (
                                    <tr key={member.id} className="border-t">
                                        <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-violet-700"><UserRound className="size-4" /></span><div><p className="font-semibold">{member.name}</p><p className="text-xs text-slate-500">{member.email}</p></div></div></td>
                                        <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{member.role}</span></td>
                                        <td className="px-4 py-3 text-xs text-slate-600">{member.class_ids.length ? classes.filter((item) => member.class_ids.includes(item.id)).map((item) => item.name).join(', ') : 'No classes assigned'}</td>
                                        <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" title="Edit teacher" onClick={() => openEdit(member)} className="rounded-md border p-2 text-slate-600 hover:border-violet-500 hover:text-violet-700"><Pencil className="size-4" /></button><button type="button" title="Remove teacher" onClick={() => confirm('Remove this teacher from the madrasa?') && router.delete(`/admin/staff/${member.id}`)} className="rounded-md border p-2 text-slate-600 hover:border-rose-500 hover:text-rose-700"><Trash2 className="size-4" /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}
