export const userDbRecordRoles = ['ADMIN', 'BASIC'] as const;

export const permissionRoles = ['PUBLIC', ...userDbRecordRoles] as const;
export type PermissionRole = (typeof permissionRoles)[number];
