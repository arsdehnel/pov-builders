import { EnterIcon, ExitIcon, HomeIcon } from '@radix-ui/react-icons';
import type { Permission } from '@/types';

type NavItem = {
	key: string;
	label: string;
	href: string;
	icon?: React.ComponentType;
	requiredPermission: Permission;
	basePage?: string;
};

export const navItems: Record<string, NavItem[]> = {
	profile: [
		{
			key: 'profile',
			href: '/profile',
			label: 'Profile',
			requiredPermission: 'profile:read',
		},
		{
			key: 'api-keys',
			href: '/profile/api-keys',
			label: 'API Keys',
			requiredPermission: 'api-keys:read',
		},
		{
			key: 'login',
			label: 'Login',
			href: '/auth/login',
			icon: EnterIcon,
			requiredPermission: 'auth:login',
			basePage: 'auth',
		},
		{
			key: 'logout',
			label: 'Logout',
			href: '/auth/logout',
			icon: ExitIcon,
			requiredPermission: 'auth:logout',
			basePage: 'auth',
		},
	],
	main: [{ key: 'home', label: 'Home', href: '/', icon: HomeIcon, requiredPermission: '__controls:read' }],
};

export function getNavItems(navType: keyof typeof navItems, userPerms: Permission[] = []): NavItem[] {
	const typeNavItems = navItems[navType];
	return typeNavItems.filter(i => {
		if (!userPerms?.includes(i.requiredPermission)) {
			return false;
		}
		return true;
	});
}
