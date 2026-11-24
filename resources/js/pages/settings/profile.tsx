import { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    Building2,
    Camera,
    Check,
    CheckCircle2,
    Globe,
    HelpCircle,
    Info,
    Laptop,
    Lock,
    Mail,
    Phone,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    Upload,
    User,
    UserCheck,
    X,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

interface TenantInfo {
    id: number;
    name: string;
    role: string;
}

interface UserProfileData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    is_parent_account: boolean;
    is_verified: boolean;
    email_verified_at: string | null;
    created_at: string;
    two_factor_enabled: boolean;
    is_platform_admin: boolean;
    is_madrasa_admin: boolean;
}

interface PageProps extends Record<string, unknown> {
    auth: Auth;
    mustVerifyEmail: boolean;
    status?: string;
    tenant?: TenantInfo | null;
    userData?: UserProfileData | null;
}

export default function Profile({
    mustVerifyEmail,
    status,
    tenant,
    userData,
}: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Initial avatar preview
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar ?? null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!data.avatar) {
            setAvatarPreview(user.avatar ?? null);
        }
    }, [user.avatar, data.avatar]);

    // Advanced preference states (saved in localStorage for persistence)
    const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
        return localStorage.getItem('pref_email_alerts') !== 'false';
    });
    const [attendanceAlerts, setAttendanceAlerts] = useState<boolean>(() => {
        return localStorage.getItem('pref_attendance_alerts') !== 'false';
    });
    const [noticeAlerts, setNoticeAlerts] = useState<boolean>(() => {
        return localStorage.getItem('pref_notice_alerts') !== 'false';
    });
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        return localStorage.getItem('pref_sound_alerts') !== 'false';
    });

    const togglePref = (key: string, current: boolean, setter: (val: boolean) => void) => {
        const next = !current;
        setter(next);
        localStorage.setItem(key, String(next));
        toast.success('Preference updated');
    };

    // Form management with Inertia useForm
    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm<{
        _method: string;
        name: string;
        email: string;
        phone: string;
        avatar: File | null;
        remove_avatar: boolean;
    }>({
        _method: 'PATCH',
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        avatar: null,
        remove_avatar: false,
    });

    // Update avatar preview when file chosen
    const handleFileChange = (file: File | undefined) => {
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, PNG and WebP images are supported');
            return;
        }

        setData((prev) => ({
            ...prev,
            avatar: file,
            remove_avatar: false,
        }));

        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
    };

    // Remove avatar
    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setData((prev) => ({
            ...prev,
            avatar: null,
            remove_avatar: true,
        }));
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    // Submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/settings/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully!');
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                toast.error(firstError || 'Failed to update profile.');
            },
        });
    };

    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const roleName = userData?.is_platform_admin
        ? 'Platform Administrator'
        : tenant?.role === 'owner'
          ? 'Madrasa Owner'
          : tenant?.role === 'admin'
            ? 'Madrasa Administrator'
            : tenant?.role === 'staff'
              ? 'Teacher / Staff'
              : 'Authorized Member';

    return (
        <>
            <Head title="Profile Settings" />

            <div className="space-y-8">
                {/* ── Top Header Card ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 p-6 text-white shadow-lg">
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="size-20 rounded-full border-3 border-white/80 shadow-md">
                                    <AvatarImage
                                        src={avatarPreview ?? undefined}
                                        alt={user.name}
                                        className="size-full object-cover"
                                    />
                                    <AvatarFallback className="bg-white/20 text-2xl font-black text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 size-4.5 rounded-full bg-emerald-400 ring-2 ring-violet-700" title="Online" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-extrabold tracking-tight text-white">
                                        {user.name}
                                    </h2>
                                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-[11px] font-semibold">
                                        {roleName}
                                    </Badge>
                                </div>
                                <p className="text-xs text-violet-200 mt-0.5">
                                    {user.email}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-violet-200">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="size-3.5 text-violet-300" />
                                        <span>{tenant?.name ?? 'Madrasa Workspace'}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="size-3.5 text-emerald-300" />
                                        <span>ID: #ADM-00{user.id}</span>
                                    </span>
                                    <span>•</span>
                                    <span>Joined {userData?.created_at ?? 'Recent'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-200">
                                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Verified Account
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Main Edit Form Section ───────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload Box */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">
                            Profile Photo
                        </h3>
                        <p className="text-xs text-slate-500 mb-5">
                            Upload a high-quality picture so students, teachers, and parents can easily recognize you.
                        </p>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="relative group">
                                <Avatar className="size-24 rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
                                    <AvatarImage
                                        src={avatarPreview ?? undefined}
                                        alt={user.name}
                                        className="size-full object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-2xl font-bold text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Change Photo"
                                >
                                    <Camera className="size-6" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-3">
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                                />

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-semibold"
                                    >
                                        <Upload className="size-3.5 text-[#5b4bf7]" />
                                        <span>Upload New Photo</span>
                                    </Button>

                                    {avatarPreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveAvatar}
                                            className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 text-xs font-semibold"
                                        >
                                            <Trash2 className="size-3.5" />
                                            <span>Remove</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <Info className="size-3.5" />
                                    <span>Supports JPG, PNG or WebP · Maximum size 2MB</span>
                                </div>
                                <InputError message={errors.avatar} />
                            </div>
                        </div>
                    </div>

                    {/* Account Details Form Fields */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-900">
                                Personal Information
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Update your personal details and primary contact channels.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <User className="size-3.5 text-[#5b4bf7]" />
                                    <span>Full Name</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g. Qari Muhammad Arif"
                                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-xs"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Phone className="size-3.5 text-[#5b4bf7]" />
                                    <span>Phone Number</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="e.g. +92 300 1234567"
                                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-xs"
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Mail className="size-3.5 text-[#5b4bf7]" />
                                    <span>Email Address</span>
                                </Label>
                                {user.email_verified_at ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                        <CheckCircle2 className="size-3.5" />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-semibold text-amber-600">
                                        Unverified
                                    </span>
                                )}
                            </div>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="name@darearqam.test"
                                className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-xs"
                            />
                            <InputError message={errors.email} />

                            {mustVerifyEmail && user.email_verified_at === null && (
                                <div className="mt-2 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-800">
                                    <p>
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-bold underline hover:text-amber-900"
                                        >
                                            Click here to re-send the verification email.
                                        </Link>
                                    </p>
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-1 font-semibold text-emerald-700">
                                            A new verification link has been sent to your email.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                            <p className="text-[11px] text-slate-400">
                                Changes will be immediately reflected across your Madrasa workspace.
                            </p>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-[#5b4bf7] hover:bg-[#4d3ce5] text-white px-5 py-2 text-xs font-bold shadow-md shadow-[#5b4bf7]/30 transition-all"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* ── Advanced Feature 1: Workspace & Security Quick Status ─────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Madrasa Workspace Details */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-[#5b4bf7]">
                                    <Building2 className="size-5" />
                                </div>
                                <Badge className="bg-[#eeecff] text-[#5b4bf7] border-0 text-[10px] font-bold uppercase">
                                    Workspace
                                </Badge>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                                {tenant?.name ?? 'Madrasa Dar-e-Aqram Gurguri'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Your account is registered as <strong>{roleName}</strong> in this madrasa branch.
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Status: Active & Operational</span>
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#5b4bf7] hover:underline"
                            >
                                <span>Open Dashboard</span>
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Security & 2FA Status Card */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`flex size-9 items-center justify-center rounded-xl ${
                                    userData?.two_factor_enabled
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-amber-50 text-amber-600'
                                }`}>
                                    <Shield className="size-5" />
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-bold uppercase ${
                                        userData?.two_factor_enabled
                                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                            : 'text-amber-700 bg-amber-50 border-amber-200'
                                    }`}
                                >
                                    {userData?.two_factor_enabled ? '2FA Active' : '2FA Recommended'}
                                </Badge>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                                Security & Authentication
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {userData?.two_factor_enabled
                                    ? 'Your account is secured with Two-Factor Authentication.'
                                    : 'Protect your administrator account by enabling two-factor authentication.'}
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Password protected</span>
                            <Link
                                href="/settings/security"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#5b4bf7] hover:underline"
                            >
                                <span>Security Settings</span>
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Advanced Feature 2: Notification & Alert Preferences ─────── */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Notification & Communication Preferences
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Customize which alerts and updates you receive.
                            </p>
                        </div>
                        <Bell className="size-4.5 text-[#5b4bf7]" />
                    </div>

                    <div className="divide-y divide-slate-100">
                        {/* Pref 1: Email Alerts */}
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-xs font-bold text-slate-800">
                                    Email Fee & Overdue Alerts
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Receive email summaries when student fee vouchers are pending or overdue.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('pref_email_alerts', emailAlerts, setEmailAlerts)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                    emailAlerts ? 'bg-[#5b4bf7]' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                                        emailAlerts ? 'translate-x-5.5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Pref 2: Attendance Alerts */}
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-xs font-bold text-slate-800">
                                    Daily Attendance Status Alerts
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Get notified when daily attendance records are finalized or missed.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('pref_attendance_alerts', attendanceAlerts, setAttendanceAlerts)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                    attendanceAlerts ? 'bg-[#5b4bf7]' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                                        attendanceAlerts ? 'translate-x-5.5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Pref 3: Notice Announcements */}
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-xs font-bold text-slate-800">
                                    Madrasa Notice Board Broadcasts
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Instant in-app notification whenever a new notice or holiday announcement is posted.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('pref_notice_alerts', noticeAlerts, setNoticeAlerts)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                    noticeAlerts ? 'bg-[#5b4bf7]' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                                        noticeAlerts ? 'translate-x-5.5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Pref 4: Audio Chimes */}
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-xs font-bold text-slate-800">
                                    Real-time Notification Sound (Audio Chime)
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Play a subtle pleasant audio chime when incoming live notifications arrive.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('pref_sound_alerts', soundEnabled, setSoundEnabled)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                    soundEnabled ? 'bg-[#5b4bf7]' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                                        soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Advanced Feature 3: Current Device & Active Session ───────── */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Laptop className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-800">
                                    Current Device & Session
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Now
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                Windows PC • Authenticated session in Madrasa Dar-e-Aqram Workspace
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Danger Zone: Delete Account ──────────────────────────────── */}
                <div className="pt-2">
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
