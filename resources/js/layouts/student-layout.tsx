import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import AppLayout from '@/layouts/app-layout';
import { COPY, type StudentCopy } from '@/components/student/copy';

type Lang = 'ur' | 'en';
type ShellContextValue = {
    lang: Lang;
    t: StudentCopy;
    search: string;
    setSearch: (value: string) => void;
};
const StudentShellContext = createContext<ShellContextValue | null>(null);

export function useStudentShell(): ShellContextValue {
    const value = useContext(StudentShellContext);
    if (!value)
        throw new Error('useStudentShell must be used inside StudentLayout.');
    return value;
}

export default function StudentLayout({ children }: { children: ReactNode }) {
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
        () => ({ lang, t: COPY[lang], search, setSearch }),
        [lang, search],
    );

    return (
        <StudentShellContext.Provider value={context}>
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
        </StudentShellContext.Provider>
    );
}
