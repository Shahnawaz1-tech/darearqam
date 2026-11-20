import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-[#1d5140] text-white shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-semibold text-slate-900">Dar-e-Arqam</span>
                <span className="mt-0.5 truncate text-[10px] leading-tight text-slate-400">Administration</span>
            </div>
        </>
    );
}
