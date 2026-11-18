export type TenantRole =
    | 'owner'
    | 'admin'
    | 'member'
    | 'staff'
    | 'student'
    | 'parent';

export type TenantSummary = {
    id: number;
    name: string;
    role: TenantRole;
};

export type Tenancy = {
    tenants: TenantSummary[];
    current: TenantSummary | null;
};
