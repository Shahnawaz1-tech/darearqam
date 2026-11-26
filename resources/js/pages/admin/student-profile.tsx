import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { index as studentsIndex } from '@/routes/admin/students';
import {
    destroyDocument,
    storeDocument,
} from '@/actions/App/Http/Controllers/Admin/StudentProfileController';
import {
    promote,
    reAdmit,
    transfer,
} from '@/actions/App/Http/Controllers/Admin/StudentEnrollmentController';
import {
    applyDiscount,
    recordPayment,
    reversePayment,
} from '@/actions/App/Http/Controllers/Admin/FeeController';
import {
    storeLog,
    updateEnrollment,
} from '@/actions/App/Http/Controllers/Admin/HifzController';

type DocumentRecord = {
    id: number;
    type: string;
    title: string;
    mime_type: string | null;
    file_size: number | null;
    url: string;
    uploaded_by: string | null;
    created_at: string | null;
};

type Props = Record<string, unknown> & {
    student: Record<string, any>;
    guardians: Record<string, any>[];
    documents: DocumentRecord[];
    attendance: Record<string, any>;
    fees: Record<string, any>[];
    feeInvoices: Record<string, any>[];
    results: Record<string, any>[];
    examSummaries: Record<string, any>[];
    hifz: Record<string, any>;
    assignments: Record<string, any>[];
    remarks: Record<string, any>[];
    enrollments: Record<string, any>[];
    statusHistory: Record<string, any>[];
    activityHistory: Record<string, any>[];
    academicOptions: {
        classes: { id: number; name: string }[];
        sections: { id: number; class_id: number; name: string }[];
    };
};

const tabs = [
    'Overview',
    'Personal',
    'Guardian',
    'Academic',
    'Attendance',
    'Fees',
    'Results',
    'Hifz',
    'Assignments',
    'Documents',
    'Activity',
];

export default function StudentProfile({
    student,
    guardians,
    documents,
    attendance,
    fees,
    feeInvoices,
    results,
    hifz,
    examSummaries,
    assignments,
    remarks,
    enrollments,
    statusHistory,
    activityHistory,
    academicOptions,
}: Props) {
    const [tab, setTab] = useState('Overview');
    const [academicAction, setAcademicAction] = useState<'promote' | 'transfer' | 're-admit'>('promote');
    const academicForm = useForm({
        class_id: student.class?.id?.toString() ?? '',
        section_id: '',
        academic_year: student.academic_year ?? '',
        started_at: '',
        reason: '',
    });
    const documentForm = useForm({
        type: 'other',
        title: '',
        file: null as File | null,
    });
    const hifzEnrollmentForm = useForm({
        hifz_program: hifz.enrollment?.hifz_program ? '1' : '0',
        nazra_program: hifz.enrollment?.nazra_program ? '1' : '0',
        hifz_start_date: hifz.enrollment?.hifz_start_date ?? '',
        quran_learning_level: hifz.enrollment?.quran_learning_level ?? '',
        assigned_hifz_teacher_id: hifz.enrollment?.assigned_hifz_teacher_id?.toString() ?? '',
        previous_hifz_progress: hifz.enrollment?.previous_hifz_progress ?? '',
    });
    const hifzLogForm = useForm({
        date: new Date().toISOString().slice(0, 10),
        type: 'sabaq',
        surah: '',
        ayat_from: '',
        ayat_to: '',
        sabaq_para: '',
        sabaq_revision: '',
        from_ref: '',
        to_ref: '',
        rating: 'good',
        memorization_quality: '3',
        remarks: '',
    });

    const info = (label: string, value: unknown) => (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{value ? String(value) : '—'}</p>
        </div>
    );

    function removeDocument(documentId: number) {
        if (!window.confirm('Remove this student document?')) return;
        router.delete(destroyDocument.url({ student: student.id, document: documentId }));
    }

    return (
        <>
            <Head title={`${student.name} - Student Profile`} />
            <main className="min-h-full p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <Link href={studentsIndex.url()} className="rounded-md border p-2">
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{student.name}</h1>
                        <p className="text-sm text-slate-500">{student.admission_number || 'No admission number'} · {student.status}</p>
                    </div>
                </div>

                <nav className="mb-5 flex gap-2 overflow-x-auto border-b pb-2">
                    {tabs.map((name) => (
                        <button key={name} type="button" onClick={() => setTab(name)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${tab === name ? 'bg-[#1d5140] text-white' : 'hover:bg-slate-100'}`}>
                            {name}
                        </button>
                    ))}
                </nav>

                {tab === 'Overview' && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {info('Admission Number', student.admission_number)}
                        {info('Class', student.class?.name)}
                        {info('Section', student.section?.name)}
                        {info('Academic Year', student.academic_year)}
                        {info('Attendance', `${attendance.percentage}%`)}
                        {info('Fee Balance', fees.reduce((total, fee) => total + Math.max(0, Number(fee.amount) - Number(fee.paid_amount)), 0))}
                        {info('Hifz Enrollment', hifz.enrollment?.hifz_program ? 'Enrolled' : 'Not enrolled')}
                        {info('Latest Result', results[0]?.exam?.title)}
                    </div>
                )}

                {tab === 'Personal' && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {info('Full Name', student.name)}
                        {info('Date of Birth', student.date_of_birth)}
                        {info('Gender', student.gender)}
                        {info('Phone', student.phone)}
                        {info('Email', student.email)}
                        {info('Address', student.address)}
                        {info('City', student.city)}
                        {info('Province', student.province)}
                        {info('Country', student.country)}
                        {info('Blood Group', student.blood_group)}
                        {info('Nationality', student.nationality)}
                        {info('Emergency Contact', student.emergency_contact)}
                    </div>
                )}

                {tab === 'Guardian' && (
                    <div className="space-y-3">
                        {guardians.length === 0 && info('Guardian', student.guardian_name)}
                        {guardians.map((guardian) => (
                            <div key={guardian.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3">
                                {info('Name', guardian.name)}
                                {info('Relationship', guardian.relationship)}
                                {info('Phone', guardian.phone)}
                                {info('Email', guardian.email)}
                                {info('Address', guardian.address)}
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'Academic' && (
                    <div className="space-y-3">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-4">
                                {info('Academic Year', enrollment.academic_year)}
                                {info('Status', enrollment.status)}
                                {info('Started', enrollment.started_at)}
                                {info('Ended', enrollment.ended_at)}
                            </div>
                        ))}
                        {enrollments.length === 0 && <p className="text-sm text-slate-500">No academic enrollment history.</p>}

                        <form
                            className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const routeDefinition =
                                    academicAction === 'promote'
                                        ? promote
                                        : academicAction === 'transfer'
                                          ? transfer
                                          : reAdmit;
                                academicForm.post(routeDefinition.url({ student: student.id }), {
                                    onSuccess: () => academicForm.reset(),
                                });
                            }}
                        >
                            <select value={academicAction} onChange={(event) => setAcademicAction(event.target.value as typeof academicAction)} className="h-9 rounded-md border px-3">
                                <option value="promote">Promote</option>
                                <option value="transfer">Transfer</option>
                                <option value="re-admit">Re-admit</option>
                            </select>
                            <select value={academicForm.data.class_id} onChange={(event) => academicForm.setData('class_id', event.target.value)} className="h-9 rounded-md border px-3">
                                <option value="">Select target class</option>
                                {academicOptions.classes.map((classOption) => (
                                    <option key={classOption.id} value={classOption.id}>{classOption.name}</option>
                                ))}
                            </select>
                            <select value={academicForm.data.section_id} onChange={(event) => academicForm.setData('section_id', event.target.value)} className="h-9 rounded-md border px-3">
                                <option value="">No section</option>
                                {academicOptions.sections
                                    .filter((section) => !academicForm.data.class_id || section.class_id === Number(academicForm.data.class_id))
                                    .map((section) => (
                                        <option key={section.id} value={section.id}>{section.name}</option>
                                    ))}
                            </select>
                            <Input value={academicForm.data.academic_year} onChange={(event) => academicForm.setData('academic_year', event.target.value)} placeholder="Academic year" />
                            <Input type="date" value={academicForm.data.started_at} onChange={(event) => academicForm.setData('started_at', event.target.value)} />
                            <Input value={academicForm.data.reason} onChange={(event) => academicForm.setData('reason', event.target.value)} placeholder={academicAction === 'promote' ? 'Reason (optional)' : 'Reason (required)'} />
                            <Button type="submit" disabled={academicForm.processing || !academicForm.data.class_id || !academicForm.data.academic_year}>
                                Apply
                            </Button>
                            <InputError message={academicForm.errors.class_id} />
                            <InputError message={academicForm.errors.academic_year} />
                            <InputError message={academicForm.errors.reason} />
                        </form>
                    </div>
                )}

                {tab === 'Attendance' && (
                    <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-4">
                            {info('Percentage', `${attendance.percentage}%`)}
                            {info('Present', attendance.present)}
                            {info('Absent', attendance.absent)}
                            {info('Leave', attendance.leave)}
                        </div>
                        {attendance.records.map((record: Record<string, any>) => (
                            <div key={record.id} className="grid grid-cols-3 gap-3 rounded-lg border p-3 text-sm">
                                <span>{record.date}</span><span className="capitalize">{record.status}</span><span>{record.note || '—'}</span>
                            </div>
                        ))}
                        {attendance.history?.map((history: Record<string, any>) => (
                            <div key={history.id} className="grid grid-cols-4 gap-3 rounded-lg border p-3 text-sm">
                                <span>{history.date}</span>
                                <span>{history.previous_status || 'Unmarked'} → {history.new_status}</span>
                                <span>{history.session}</span>
                                <span>{history.reason || 'Attendance updated'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'Fees' && (
                    <div className="space-y-2">
                        {feeInvoices.map((invoice) => (
                            <div key={invoice.id} className="space-y-3 rounded-lg border p-3">
                                <div className="grid gap-2 sm:grid-cols-6">
                                    {info('Invoice', invoice.invoice_number)}
                                    {info('Fee', invoice.title)}
                                    {info('Total', invoice.total)}
                                    {info('Paid', invoice.paid)}
                                    {info('Balance', invoice.balance)}
                                    {info('Status', invoice.status)}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {invoice.balance > 0 && (
                                        <Button type="button" size="sm" onClick={() => {
                                            const amount = window.prompt('Payment amount');
                                            if (!amount) return;
                                            router.post(recordPayment.url({ invoice: invoice.id }), {
                                                amount: Number(amount),
                                                paid_at: new Date().toISOString().slice(0, 10),
                                                method: 'cash',
                                            });
                                        }}>Record Payment</Button>
                                    )}
                                    <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const amount = window.prompt('Discount amount');
                                        const reason = window.prompt('Authorization reason');
                                        if (!amount || !reason) return;
                                        router.post(applyDiscount.url({ invoice: invoice.id }), {
                                            amount: Number(amount),
                                            reason,
                                        });
                                    }}>Apply Discount</Button>
                                </div>
                                {invoice.payments?.map((payment: Record<string, any>) => (
                                    <div key={payment.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-sm">
                                        <span>{payment.receipt_number}: {payment.amount} PKR · {payment.paid_at} · {payment.method}</span>
                                        {payment.reversed < payment.amount && (
                                            <Button type="button" size="sm" variant="ghost" onClick={() => {
                                                const amount = window.prompt('Reversal amount');
                                                const reason = window.prompt('Reversal reason');
                                                if (!amount || !reason) return;
                                                router.post(reversePayment.url({ payment: payment.id }), {
                                                    amount: Number(amount),
                                                    reason,
                                                });
                                            }}>Reverse</Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        {feeInvoices.length === 0 && fees.length === 0 && (
                            <EmptyState title="No fee records" description="This student has no fee invoices or payment history." />
                        )}
                    </div>
                )}

                {tab === 'Results' && (
                    <div className="space-y-2">
                        {examSummaries.map((summary) => (
                            <div key={summary.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-6">
                                {info('Exam', summary.exam?.title)}
                                {info('Obtained', summary.obtained_marks)}
                                {info('Total', summary.total_marks)}
                                {info('Percentage', `${summary.percentage}%`)}
                                {info('Position', summary.position)}
                                {info('Result', summary.passed ? 'Pass' : 'Fail')}
                            </div>
                        ))}
                        {results.map((result) => (
                            <div key={result.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
                                {info('Exam', result.exam?.title)}
                                {info('Subject', result.subject?.name)}
                                {info('Marks', result.marks_obtained)}
                                {info('Grade', result.grade)}
                            </div>
                        ))}
                        {results.length === 0 && examSummaries.length === 0 && (
                            <EmptyState title="No examination results" description="Published or recorded results will appear here." />
                        )}
                    </div>
                )}

                {tab === 'Hifz' && (
                    <div className="space-y-3">
                        <form
                            className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                hifzEnrollmentForm.patch(updateEnrollment.url({ student: student.id }));
                            }}
                        >
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hifzEnrollmentForm.data.hifz_program === '1'} onChange={(event) => hifzEnrollmentForm.setData('hifz_program', event.target.checked ? '1' : '0')} /> Hifz enrolled</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hifzEnrollmentForm.data.nazra_program === '1'} onChange={(event) => hifzEnrollmentForm.setData('nazra_program', event.target.checked ? '1' : '0')} /> Nazra enrolled</label>
                            <Input type="date" value={hifzEnrollmentForm.data.hifz_start_date} onChange={(event) => hifzEnrollmentForm.setData('hifz_start_date', event.target.value)} />
                            <Input value={hifzEnrollmentForm.data.quran_learning_level} onChange={(event) => hifzEnrollmentForm.setData('quran_learning_level', event.target.value)} placeholder="Quran learning level" />
                            <Input value={hifzEnrollmentForm.data.assigned_hifz_teacher_id} onChange={(event) => hifzEnrollmentForm.setData('assigned_hifz_teacher_id', event.target.value)} placeholder="Assigned Hifz teacher user ID" />
                            <Input value={hifzEnrollmentForm.data.previous_hifz_progress} onChange={(event) => hifzEnrollmentForm.setData('previous_hifz_progress', event.target.value)} placeholder="Previous progress" />
                            <Button type="submit" disabled={hifzEnrollmentForm.processing}>Save enrollment</Button>
                        </form>

                        {hifz.enrollment?.hifz_program ? (
                            <>
                                <form
                                    className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        hifzLogForm.post(storeLog.url({ student: student.id }), { onSuccess: () => hifzLogForm.reset() });
                                    }}
                                >
                                    <Input type="date" value={hifzLogForm.data.date} onChange={(event) => hifzLogForm.setData('date', event.target.value)} />
                                    <select value={hifzLogForm.data.type} onChange={(event) => hifzLogForm.setData('type', event.target.value)} className="h-9 rounded-md border px-3">
                                        <option value="sabaq">Sabaq</option>
                                        <option value="sabqi">Sabqi</option>
                                        <option value="manzil">Manzil</option>
                                    </select>
                                    <Input value={hifzLogForm.data.surah} onChange={(event) => hifzLogForm.setData('surah', event.target.value)} placeholder="Surah" />
                                    <Input value={hifzLogForm.data.ayat_from} onChange={(event) => hifzLogForm.setData('ayat_from', event.target.value)} placeholder="Ayat from" />
                                    <Input value={hifzLogForm.data.ayat_to} onChange={(event) => hifzLogForm.setData('ayat_to', event.target.value)} placeholder="Ayat to" />
                                    <Input value={hifzLogForm.data.sabaq_para} onChange={(event) => hifzLogForm.setData('sabaq_para', event.target.value)} placeholder="Sabaq para" />
                                    <Input value={hifzLogForm.data.sabaq_revision} onChange={(event) => hifzLogForm.setData('sabaq_revision', event.target.value)} placeholder="Revision" />
                                    <Input value={hifzLogForm.data.from_ref} onChange={(event) => hifzLogForm.setData('from_ref', event.target.value)} placeholder="From reference" />
                                    <Input value={hifzLogForm.data.to_ref} onChange={(event) => hifzLogForm.setData('to_ref', event.target.value)} placeholder="To reference" />
                                    <select value={hifzLogForm.data.rating} onChange={(event) => hifzLogForm.setData('rating', event.target.value)} className="h-9 rounded-md border px-3">
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="needs_work">Needs Work</option>
                                    </select>
                                    <Input type="number" min="1" max="5" value={hifzLogForm.data.memorization_quality} onChange={(event) => hifzLogForm.setData('memorization_quality', event.target.value)} placeholder="Quality 1-5" />
                                    <Input value={hifzLogForm.data.remarks} onChange={(event) => hifzLogForm.setData('remarks', event.target.value)} placeholder="Teacher remarks" />
                                    <Button type="submit" disabled={hifzLogForm.processing}>Save Hifz log</Button>
                                </form>

                                {hifz.monthly?.map((month: Record<string, any>) => (
                                    <div key={month.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-6">
                                        {info('Month', month.month)}
                                        {info('Sabaq', month.sabaq_count)}
                                        {info('Sabqi', month.sabqi_count)}
                                        {info('Manzil', month.manzil_count)}
                                        {info('Excellent', month.excellent_count)}
                                        {info('Needs Work', month.needs_work_count)}
                                    </div>
                                ))}
                                {hifz.logs.map((log: Record<string, any>) => (
                                    <div key={log.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-6">
                                        {info('Date', log.date)}
                                        {info('Type', log.type)}
                                        {info('Surah', log.surah)}
                                        {info('Ayat', `${log.ayat_from || ''}-${log.ayat_to || ''}`)}
                                        {info('Rating', log.rating)}
                                        {info('Remarks', log.remarks)}
                                    </div>
                                ))}
                            </>
                        ) : <p className="text-sm text-slate-500">The student is not enrolled in Hifz.</p>}
                    </div>
                )}

                {tab === 'Assignments' && (
                    <div className="space-y-2">
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
                                {info('Assignment', assignment.title)}
                                {info('Course', assignment.course)}
                                {info('Status', assignment.status)}
                                {info('Marks', assignment.marks)}
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <EmptyState title="No assignment submissions" description="Homework submissions and grades will appear here." />
                        )}
                    </div>
                )}

                {tab === 'Documents' && (
                    <div className="space-y-5">
                        <form
                            className="grid gap-3 rounded-xl border p-4 sm:grid-cols-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                documentForm.post(storeDocument.url({ student: student.id }), {
                                    forceFormData: true,
                                    onSuccess: () => documentForm.reset(),
                                });
                            }}
                        >
                            <select value={documentForm.data.type} onChange={(event) => documentForm.setData('type', event.target.value)} className="h-9 rounded-md border px-3">
                                <option value="birth_certificate">Birth Certificate</option>
                                <option value="b_form">B-Form</option>
                                <option value="previous_certificate">Previous Certificate</option>
                                <option value="photograph">Photograph</option>
                                <option value="other">Other</option>
                            </select>
                            <Input value={documentForm.data.title} onChange={(event) => documentForm.setData('title', event.target.value)} placeholder="Document title" />
                            <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => documentForm.setData('file', event.target.files?.[0] ?? null)} />
                            <Button type="submit" disabled={documentForm.processing || !documentForm.data.file}>
                                <Upload className="size-4" /> Upload
                            </Button>
                            <InputError message={documentForm.errors.file} />
                            <InputError message={documentForm.errors.title} />
                        </form>
                        {documents.map((document) => (
                            <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">{document.title}</p>
                                    <p className="text-xs text-slate-500">{document.type} · {document.file_size ? `${Math.ceil(document.file_size / 1024)} KB` : 'Unknown size'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <a href={document.url} target="_blank" rel="noreferrer"><Button type="button" variant="outline"><Download className="size-4" /> View</Button></a>
                                    <Button type="button" variant="ghost" className="text-red-600" onClick={() => removeDocument(document.id)}><Trash2 className="size-4" /></Button>
                                </div>
                            </div>
                        ))}
                        {documents.length === 0 && <p className="text-sm text-slate-500">No documents uploaded.</p>}
                    </div>
                )}

                {tab === 'Activity' && (
                    <div className="space-y-3">
                        {activityHistory.map((activity) => (
                            <div key={activity.id} className="rounded-lg border p-3">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <p className="text-xs text-slate-500">{activity.action} · {activity.created_at}</p>
                            </div>
                        ))}
                        {statusHistory.map((history) => (
                            <div key={history.id} className="rounded-lg border p-3">
                                <p className="text-sm font-medium">{history.previous_status || 'None'} → {history.new_status}</p>
                                <p className="text-xs text-slate-500">{history.reason} · {history.created_at}</p>
                            </div>
                        ))}
                        {activityHistory.length === 0 && statusHistory.length === 0 && <p className="text-sm text-slate-500">No activity history.</p>}
                        {remarks.map((remark) => info('Remark', `${remark.category}: ${remark.body}`))}
                    </div>
                )}
            </main>
        </>
    );
}
