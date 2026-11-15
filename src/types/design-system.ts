import type { JSX } from 'react';
import type { Permission } from '@/types';

export type DSLink = {
	href: string;
	label: JSX.Element | string;
	requiredPermission: Permission;
} & React.ComponentPropsWithoutRef<'a'>;

export type DSTableColumn = {
	label: string;
	key: string;
	actions?: ({
		type: 'link' | 'button' | 'confirm-button';
		hrefProp?: string;
		handler?: (val: string, record: Record<string, unknown>) => void | Promise<void>;
		confirmTitle?: string;
		confirmDescription?: string;
	} & Omit<DSLink, 'href'>)[];
	render?: (val: string, record: Record<string, unknown>) => React.ReactNode | string;
};
