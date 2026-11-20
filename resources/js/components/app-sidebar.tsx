import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    LayoutDashboard,
    Settings2,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { tenancy } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const items: NavItem[] = [
        { title: 'Overview', href: dashboard(), icon: LayoutDashboard },
        ...(tenancy.current && ['owner', 'admin'].includes(tenancy.current.role)
            ? [
                  {
                      title: 'Madrasas',
                      href: `${dashboard.url()}#madrasas`,
                      icon: Building2,
                  },
                  {
                      title: 'People & access',
                      href: `${dashboard.url()}#people`,
                      icon: UsersRound,
                  },
              ]
            : []),
        { title: 'Account settings', href: editProfile(), icon: Settings2 },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-3 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="mx-2 mt-3 rounded-xl border border-sidebar-border bg-white/70 px-3 py-3 group-data-[collapsible=icon]:hidden">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        Current workspace
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {tenancy.current?.name ?? 'Personal account'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {tenancy.current?.role ?? 'No madrasa selected'}
                    </p>
                </div>
            </SidebarHeader>
            <SidebarContent className="pt-3">
                <SidebarGroup className="px-3">
                    <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-3">
                <div className="mb-2 rounded-xl bg-emerald-950 px-3 py-3 text-white group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-semibold">Dar-e-Arqam</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/75">
                        A calm place to manage your madrasa workspace.
                    </p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
