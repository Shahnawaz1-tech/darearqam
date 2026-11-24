import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import AppLayout from '@/layouts/app-layout';
import { TEACHER_COPY, type TeacherCopy } from '@/components/teacher/copy';

type Lang = 'ur' | 'en';
type ShellContext = {
    lang: Lang;
    t: TeacherCopy;
    search: string;
    setSearch: (value: string) => void;
};
const TeacherShellContext = createContext<ShellContext | null>(null);

export function useTeacherShell(): ShellContext {
    const value = useContext(TeacherShellContext);
    if (!value)
        throw new Error('useTeacherShell must be used inside TeacherLayout.');
    return value;
}

export default function TeacherLayout({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('ur');
    const [search, setSearch] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('lang');
            if (saved === 'ur' || saved === 'en') setLang(saved);
        } catch {
            /* local storage may be unavailable */
        }
    }, []);

    const context = useMemo(
        () => ({ lang, t: TEACHER_COPY[lang], search, setSearch }),
        [lang, search],
    );

    return (
        <TeacherShellContext.Provider value={context}>
            <AppLayout>
                <div
                    className="min-h-[calc(100svh-64px)] bg-[var(--page)] text-slate-800"
                    lang={lang}
                    dir={lang === 'ur' ? 'rtl' : 'ltr'}
                    style={{
                        fontFamily:
                            lang === 'ur'
                                ? "'Noto Nastaliq Urdu', serif"
                                : "'Inter', system-ui, sans-serif",
                        lineHeight: lang === 'ur' ? 2.1 : 1.55,
                    }}
                >
                    {children}
                </div>
            </AppLayout>
        </TeacherShellContext.Provider>
    );
}
