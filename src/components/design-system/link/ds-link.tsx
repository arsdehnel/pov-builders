import type { DSLink as DSLinkType, Permission } from '@/types';

export default function DSLink({
	label,
	requiredPermission,
	userPermissions,
	...other
}: {
	userPermissions: Permission[];
} & DSLinkType): React.ReactNode {
	if (!userPermissions?.includes(requiredPermission)) {
		return null;
	}
	return <a {...other}>{label}</a>;
}
