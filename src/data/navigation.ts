import { EnterIcon, ExitIcon, HomeIcon } from '@radix-ui/react-icons';
import type { Permission } from '@/types';

export type ViewMode = { key: string; label: string };

export const VIEW_MODES: ViewMode[] = [
	{ key: 'survey', label: 'Survey' },
	{ key: 'statements', label: 'Statements' },
	{ key: 'choose-your-own-adventure', label: 'Choose Your Own Adventure' },
	{ key: 'character-builder', label: 'Character Builder' },
];

export type NavItem = {
	key: string;
	label: string;
	href: string;
	icon?: React.ComponentType;
	requiredPermission: Permission;
	basePage?: string;
};

/** Serializable subset of NavItem safe to pass across the RSC boundary to client components. */
export type ClientNavItem = Omit<NavItem, 'icon'>;

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
			href: '/api/oauth/logout',
			icon: ExitIcon,
			requiredPermission: 'auth:logout',
			basePage: 'auth',
		},
	],
	main: [{ key: 'home', label: 'Home', href: '/', icon: HomeIcon, requiredPermission: '__controls:read' }],
};

export function topicUrl(subdomain: string, currentHostname: string): string {
	if (import.meta.env.DEV) {
		return `/dev/topic/${subdomain}`;
	}
	const cfDomain = 'pov.builders';
	const envs = ['integration', 'staging'];
	const [firstPortion, ...rest] = currentHostname.split('.');
	if (envs.includes(firstPortion) || currentHostname === cfDomain) {
		return `https://${subdomain}.${currentHostname}`;
	}
	return `https://${subdomain}.${rest.join('.')}`;
}

export function getNavItems(navType: keyof typeof navItems, userPerms: Permission[] = []): NavItem[] {
	const typeNavItems = navItems[navType];
	return typeNavItems.filter(i => {
		if (!userPerms?.includes(i.requiredPermission)) {
			return false;
		}
		return true;
	});
}
