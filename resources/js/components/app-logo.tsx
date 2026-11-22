export default function AppLogo() {
    return (
        <>
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f7f4e8] shadow-sm ring-1 ring-white/25 group-data-[collapsible=icon]:size-8">
                <img
                    src="/madrasa-logo.png"
                    alt=""
                    className="size-full object-contain"
                />
            </span>
            <span className="ml-1 grid min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm leading-tight font-bold text-slate-900 dark:text-slate-100">
                    Madrasa Dar-e-Arqam
                </span>
                <span className="mt-0.5 truncate text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                    Gurguri
                </span>
            </span>
        </>
    );
}
